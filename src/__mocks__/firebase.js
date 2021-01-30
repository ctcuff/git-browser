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

firebase.auth.GithubAuthProvider = function () {
  this.addScope = jest.fn()
}

export default firebase
