import moment from 'moment-timezone'

const getLocalTime = (date: Date) => {
  return new Date(
    moment(date)
      .tz('Asia/Calcutta')
      .format('YYYY-MM-DDThh:mm:ss')
  )
}

export default getLocalTime
