import { KNOCKOUT_STAGES } from "../lib/constants";
import { predictionsToMap, toApiPrediction } from "../lib/mappers";
import { matchRepository } from "../repositories/match.repository";
import { predictionRepository } from "../repositories/prediction.repository";
import { userRepository } from "../repositories/user.repository";
import { toApiMatch, toApiUser } from "../lib/mappers";

export async function getDashboardData() {
  const [users, matches, predictions] = await Promise.all([
    userRepository.findAll(),
    matchRepository.findAll(),
    predictionRepository.findAll()
  ]);

  const apiUsers = users.map(toApiUser);
  const apiMatches = matches.map(toApiMatch).filter((match) => KNOCKOUT_STAGES.has(match.stage));
  const predictionMap = predictionsToMap(predictions.map(toApiPrediction));

  return { users: apiUsers, matches: apiMatches, predictions: predictionMap };
}
