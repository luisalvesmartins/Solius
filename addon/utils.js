function convertToBinary (number) {
    let num = number;
    let binary = (num % 2).toString();
    for (; num > 1; ) {
        num = parseInt(num / 2);
        binary =  (num % 2) + (binary);
    }
    return binary;
}
function highByte(v){
    return (v >> 8) & 0xFF;
}
function lowByte(v){
    return v & 0xFF;
}

module.exports= {
    convertToBinary,
    highByte,
    lowByte
}