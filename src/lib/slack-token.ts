// This is a simple in-memory store. In production, use a database
let slackTokens: { [userId: string]: string } = {};

export const SlackTokenManager = {
  setToken: (userId: string, token: string) => {
    slackTokens[userId] = token;
  },

  getToken: (userId: string) => {
    return slackTokens[userId];
  },

  hasToken: (userId: string) => {
    return !!slackTokens[userId];
  }
};