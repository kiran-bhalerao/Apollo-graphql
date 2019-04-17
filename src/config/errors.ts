export const errorName = {
  UNAUTHORIZED: 'unauthorized',
  INVALID_PASS: 'invalidPassword',
  INVALID_USERNAME: 'invalidUsername',
  INVALID_POST: 'invalidPost'
}

export const errorType = {
  unauthorized: {
    message: 'Access is denied due to invalid credentials',
    statusCode: 401
  },
  invalidPassword: {
    message: 'Invalid password',
    statusCode: 403
  },
  invalidUsername: {
    message: 'Invalid username',
    statusCode: 403
  },
  invalidPost: {
    message: 'post not belongs to you',
    statusCode: 404
  }
}
