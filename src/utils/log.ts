import colors from 'colors/safe'

const red = (I: any) => console.log(`\n${colors.red(I)}\n`)
const green = (I: any) => console.log(`\n${colors.green(I)}\n`)
const rainbow = (I: any) => console.log(`\n${colors.rainbow(I)}\n`)
const bgRed = (I: any) => console.log(`\n${colors.bgRed(I)}\n`)
const blue = (I: any) => console.log(`\n${colors.blue(I)}\n`)

export default { ...console, red, green, rainbow, bgRed, blue }
