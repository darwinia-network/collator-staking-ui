export const GET_LATEST_STAKING_REWARDS = `
  query stakingRewards($accountAddress: String!, $itemsCount: Int) {
    stakingRecord(id: $accountAddress) {
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
