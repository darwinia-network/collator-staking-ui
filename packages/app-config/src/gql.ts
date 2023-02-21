import { gql } from "@apollo/client";
export const GET_LATEST_STAKING_REWARDS = gql`
  query stakingRewards($accountAddress: String!, $itemsCount: Int) {
    stakingRecord(id: $accountAddress) {
      id
      totalReward
      rewards(first: $itemsCount, orderBy: BLOCK_NUMBER_DESC) {
        nodes {
          id
          blockTime
          blockNumber
          amount
        }
      }
    }
  }
`;
