import { Activity, Team, User, Workout } from '../models/index.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const invalidInput = () => Object.assign(new Error('A valid userId, teamId, type, and positive minutes are required'), { status: 400 });
  if (!isRecord(input)) throw invalidInput();

  const { userId, teamId, type, minutes } = input;
  if (
    typeof userId !== 'string' || !/^[a-f\d]{24}$/i.test(userId) ||
    typeof teamId !== 'string' || !/^[a-f\d]{24}$/i.test(teamId) ||
    typeof type !== 'string' || !type.trim() ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1
  ) {
    throw invalidInput();
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) {
    throw Object.assign(new Error('The specified user or team does not exist'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const invalidInput = () => Object.assign(new Error('A team name and mascot are required, with member IDs as an array'), { status: 400 });
  if (!isRecord(input)) throw invalidInput();

  const { name, mascot, members = [] } = input;
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof mascot !== 'string' || !mascot.trim() ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !/^[a-f\d]{24}$/i.test(member))
  ) {
    throw invalidInput();
  }

  const uniqueMemberIds = [...new Set(members as string[])];
  if (uniqueMemberIds.length > 0) {
    const foundMembers = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (foundMembers !== uniqueMemberIds.length) {
      throw Object.assign(new Error('One or more team members do not exist'), { status: 404 });
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ _id: import('mongoose').Types.ObjectId; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return totals.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const recentTypes = new Set(activities.map(({ type }) => type.toLowerCase()));
  const goal = user.fitnessGoal.toLowerCase();
  const activityFocus = recentTypes.has('strength') ? 'strength' : recentTypes.size > 0 ? 'endurance' : undefined;
  const preferredFocus = workouts.some(({ focus }) => focus.toLowerCase() === goal)
    ? goal
    : activityFocus;

  const matchingWorkouts = preferredFocus
    ? workouts.filter(({ focus }) => focus.toLowerCase() === preferredFocus)
    : workouts;
  const suggestions = matchingWorkouts.length > 0 ? matchingWorkouts : workouts;
  const reason = preferredFocus
    ? `Matched your ${preferredFocus} goal and activity`
    : 'Recommended based on available workouts';

  return suggestions.map((workout) => ({ ...workout, reason }));
}

export { User };
