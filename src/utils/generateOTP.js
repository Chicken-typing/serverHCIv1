export default function generateOTP() {
    return Math.floor( Math.random()*Math.pow(10,6))
}