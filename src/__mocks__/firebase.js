const firebase = {
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    signInWithPopup: jest.fn(() => ({
      credential: {
        accessToken: 'mock-access-token'
      },
      additionalUserInfo: {
        username: 'mock-user'
      }
    })),
    signOut: jest.fn(() => Promise.resolve())
  }))
}

firebase.auth.GithubAuthProvider = class {}

export default firebase
