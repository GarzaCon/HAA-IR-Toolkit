
function getIRProtocol_Standard_N_Bits()
{
    // get values entered by the user
    var userInputObject = getUserInputStandard();
    // get captured packets in an array
    var allIRPacketsArray = getAllIRPacketsArray(document.getElementById("inputIR").value);
    // calculate averages, protocol bits, etc
    var averagesObject = getAverageArraysForPacketsArray(allIRPacketsArray, userInputObject);
    // show protocol Bits on page
    $("#protocolBits").val(JSON.stringify(averagesObject.protocolBitsArray) + ' - ' + averagesObject.protocolNumberOfBits + ' bits protocol');

    if (averagesObject.protocolNumberOfBits === 2 || averagesObject.protocolNumberOfBits === 4 || averagesObject.protocolNumberOfBits === 6) {

        // 1. calculate bits string
        var bitsString = calculateBits(averagesObject);
        var bitsPlusCount = bitsString + " - " + bitsString.length + " bits";
        var currentBits = document.getElementById("standardBitsString").value;
        if (currentBits.length > 0) {
            document.getElementById("standardBitsString").value =
                currentBits + "\n" + bitsPlusCount;
        } else {
            document.getElementById("standardBitsString").value = bitsPlusCount;
        }

        // 2. calculate protocol
        var resultProtocol = calculateProtocol(averagesObject, allIRPacketsArray, userInputObject.roundingTo);
        var currentOutputProtocol = document.getElementById("outputProtocol").value;
        if (currentOutputProtocol.length > 0) {
            document.getElementById("outputProtocol").value =
                currentOutputProtocol + "\n" + resultProtocol;
        } else {
            document.getElementById("outputProtocol").value = resultProtocol;
        }

        // 3. find protocol Command
        var protocolString = calculateProtocolCommand(averagesObject, bitsString);
        var currentProtocolValue = document.getElementById("outputProtocolCommand").value;
        if (currentProtocolValue.length > 0) {
            document.getElementById("outputProtocolCommand").value =
                currentProtocolValue + "\n" + protocolString;
        } else {
            document.getElementById("outputProtocolCommand").value = protocolString;
        }

    } else {
        // show error, unsupported number of bits
        document.getElementById("outputIR").value = "Invalid number of bits detected: " + averagesObject.protocolNumberOfBits + " - Try increasing Max Diff Range";
    }
}

function calculateProtocolCommand(averagesObject, bitsString)
{
    var protocolCommandString = '';
    //console.log("calculateProtocolCommand");

    var lastChar = "";
    var currentSequence = "";
    for (var i = 0; i < bitsString.length; i++) {
        var currentChar = bitsString.charAt(i);
        //console.log(currentChar + " -- " + lastChar);
        if (currentChar === lastChar || i === 0) {
            currentSequence += currentChar;
        } else {
            // bit changed
            protocolCommandString += getProtocolLetterNBits(currentSequence, averagesObject.protocolNumberOfBits);
            currentSequence = currentChar;
        }
        lastChar = currentChar;
        //console.log(currentChar);
    }
    // take care of last chars
    if (currentSequence.length > 0) {
        protocolCommandString += getProtocolLetterNBits(currentSequence, averagesObject.protocolNumberOfBits);
    }
    return protocolCommandString;
}

function calculateBits(averagesObject)
{
    var bits = "";

    // default is to skip first 2 (header) and last (footer)
    var firstElement = 2;
    var lastElement = averagesObject.newIRCodeArray.length - 1;
    if (document.getElementById("noheader").checked) {
        firstElement = 0;
    }
    if (document.getElementById("nofooter").checked) {
        lastElement = averagesObject.newIRCodeArray.length;
    }
    //console.log(averagesObject.arrayBits);

    for (var i = firstElement; i < lastElement - 1; i++) {
        //console.log(arrayCodes[i]);
        var currentBit =  averagesObject.newIRCodeArray[i]+'-'+averagesObject.newIRCodeArray[i+1];
        //console.log(currentBit);
        var index = averagesObject.protocolBitsArray.indexOf(currentBit);
        //console.log(index);
        bits+= index;
        // skip one since we are getting the couple for each loop
        i++;
    }
    return bits;

}

function calculateProtocol(averagesObject, allIRPacketsArray, roundingTo){
    /*
    console.log('averagesObject.newIRCodeArray');
    console.log(averagesObject.newIRCodeArray);
    console.log('allPacketsArray');
    console.log(allIRPacketsArray);
    console.log('averagesObject.newIRCodeArray');
    */
    //console.log(averagesObject.newIRCodeArray);


    //var convertedArray = averagesObject.newIRCodeArray;
    var protocol = "";
    var stringWithBits = "";

    // add header values rounded
    //protocol += 'H:';
    var packet = averagesObject.newIRCodeArray[0];
    stringWithBits += "Header:" + packet;
    var valueTmp = Math.round(packet/roundingTo)*roundingTo;
    //console.log('valueTemp ' + valueTmp);
    protocol += encoderTable[valueTmp];
    // 2nd header value
    packet = averagesObject.newIRCodeArray[1];
    stringWithBits += "-" + packet;
    valueTmp = Math.round(packet/roundingTo)*roundingTo;
    //console.log('valueTemp ' + valueTmp);
    protocol += encoderTable[valueTmp];

    for (var i= 0; i<averagesObject.protocolBitsArray.length;i++) {
        //protocol += ' Bit'+i+':';
        var packetArray = averagesObject.protocolBitsArray[i].split('-');
        stringWithBits += " B"+i+':' + packetArray[0] + '-'+packetArray[1];
        protocol += encoderTable[packetArray[0]];
        protocol += encoderTable[packetArray[1]];
    }

    //protocol += encoderTable[averagesObject.newIRCodeArray[0]];
    //protocol += encoderTable[averagesObject.newIRCodeArray[1]];
    //finalProtocolString +=protocolValue;
    //protocol += ' Footer: ';
    packet = averagesObject.newIRCodeArray[averagesObject.newIRCodeArray.length-1];
    stringWithBits += " Footer:" + packet;
    //console.log('packet footer ' + packet);
    valueTmp = Math.round(packet/roundingTo)*roundingTo;
    //console.log('valueTemp ' + valueTmp);
    protocol += encoderTable[valueTmp];
    return JSON.stringify(protocol) + ' based on ' + stringWithBits;
}

function getAllIRPacketsArray(irCodes)
{
    irCodes = irCodes.replace(/\s+/g, "");
    irCodes = irCodes.replace(/\+/g,' ');
    irCodes = irCodes.replace(/-/g,' ');
    irCodes = irCodes.trim();
    return irCodes.split(" ");
}

function calculateZeroOrOne(douple, selectedProtocol)
{
    //console.log(douple);
    var zeroOrOne = "";
    var value1 = douple[0];
    var value2 = douple[1];
    var difBetweenValues = douple[1] - douple[0];
    difBetweenValues = Math.abs(difBetweenValues);
    var minValue = Math.min(value1, value2);

    //if (difBetweenValues > value1) {
    if (difBetweenValues > (minValue*1.4)) {
        zeroOrOne = "1";
    } else {
        zeroOrOne = "0";
    }
    if (selectedProtocol !== "none") {
        var resultMultiplier = Math.abs(value1 * 50);
        //console.log("values " + value1 + " " + value2);
        //console.log("resultMultiplier " + resultMultiplier);
        if (value2 > resultMultiplier) {
            zeroOrOne = "P";
        }
    }
    return zeroOrOne;
}

function calculateDaikinRawProtocol(onlybits, selectedProtocol)
{
    var selectedProtocoValues = getSelectedProtocolValues(selectedProtocol);
    var daikinRawProtocol = selectedProtocoValues.prefixvalue;
    for (var i = 0; i < onlybits.length; i++) {
        var currentChar = onlybits.charAt(i);
        //console.log(currentChar + " -- " + lastChar);
        if (currentChar === "0") {
            daikinRawProtocol += selectedProtocoValues.bit0value;
        } else if (currentChar === "P") {
            daikinRawProtocol += selectedProtocoValues.longpausevalue;
            daikinRawProtocol += selectedProtocoValues.prefixvalue;
            i++;
        } else {
            // bit 1
            daikinRawProtocol += selectedProtocoValues.bit1value;
        }
    }
    daikinRawProtocol += selectedProtocoValues.footervalue;
    return daikinRawProtocol;
}

function getSelectedProtocolValues(selectedProtocol)
{
    var protocolValues = {};
    protocolValues.prefixvalue = document.getElementById("prefixvalue").value;
    protocolValues.bit0value = document.getElementById("bit0value").value;
    protocolValues.bit1value = document.getElementById("bit1value").value;
    protocolValues.longpausevalue = document.getElementById(
        "longpausevalue"
    ).value;
    protocolValues.footervalue = document.getElementById("footervalue").value;
    return protocolValues;
}

function getProtocolLetterNBits(currentSequence, protocolNumberOfBits)
{
    var returnLetters = "";
    var protocolStringMaxLength = getProtocolStringMaxLength(protocolNumberOfBits);
    console.log("getProtocolLetterNBits currentSequence " + currentSequence);

    var firstDigit = currentSequence.charAt(0);
    var currentSequenceLength = currentSequence.length;
    //console.log("currentSequenceLength " + currentSequenceLength);
    //console.log("firstDigit " + firstDigit);
    if (currentSequenceLength > protocolStringMaxLength) {

        //returnLetters = protocolLetters4Bit[firstDigit][12];
        returnLetters = getProtocolLetterFromArrays(firstDigit, protocolStringMaxLength-1, protocolNumberOfBits);
        currentSequenceLength -= protocolStringMaxLength;
    }
    //returnLetters += protocolLetters4Bit[firstDigit][currentSequenceLength-1];
    returnLetters += getProtocolLetterFromArrays(firstDigit, currentSequenceLength-1, protocolNumberOfBits);

    console.log("returning letter(s) --> " + returnLetters);
    return returnLetters;
}

function getProtocolLetterFromArrays(bit, position, protocolNumberOfBits)
{
    console.log("bit and position: " + bit +' ' + position);
    var protocolLetter = '';
    switch (protocolNumberOfBits) {
        case 2:
            protocolLetter = protocolLetters2Bit[bit][position];
            break;
        case 4:
            protocolLetter = protocolLetters4Bit[bit][position];
            break;
        case 6:
            protocolLetter = protocolLetters6Bit[bit][position];
            break;
    }

    return protocolLetter;
}

function getProtocolStringMaxLength(protocolNumberOfBits)
{
    var protocolStringMaxLength = 0;
    switch (protocolNumberOfBits) {
        case 2:
            protocolStringMaxLength = 26;
            break;
        case 4:
            protocolStringMaxLength = 13;
            break;
        case 6:
            protocolStringMaxLength = 9;
            break;
    }
    return protocolStringMaxLength;
}

function getProtocolLetter(currentSequence)
{
    var returnLetters = "";
    //console.log("getProtocolLetter " + currentSequence);

    var firstDigit = currentSequence.charAt(0);
    var currentSequenceLength = currentSequence.length;
    //console.log("currentSequenceLength " + currentSequenceLength);
    //console.log("firstDigit " + firstDigit);
    if (currentSequenceLength > 26) {
        if (firstDigit === "0") {
            returnLetters = zerosLetters[25];
        } else {
            returnLetters = onesLetters[25];
        }
        currentSequenceLength -= 26;
    }
    if (currentSequence.charAt(0) === "0") {
        // it's zeros
        returnLetters += zerosLetters[currentSequenceLength - 1];
    } else {
        // it's ones
        returnLetters += onesLetters[currentSequenceLength - 1];
    }
    //console.log("returning " + returnLetters);
    return returnLetters;
}

function openTab(evt, tabName)
{
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function doPseudoRAWLogic()
{
    var irCodes = document.getElementById("inputIRPseudo").value;
    // remove spaces
    irCodes = irCodes.replace(/\s+/g, "");
    irCodes = irCodes.replace(/\+/g,' ');
    irCodes = irCodes.replace(/-/g,' ');
    irCodes = irCodes.trim();

    //irCodes = irCodes.replace('-','-')
    //console.log(irCodes);
    // now split couples by +
    var arrayCodes = irCodes.split(" ");

    $("#preprocessOutput").val(arrayCodes);

    var maxDifference = $("#maxrange").val();
    var roundingTo = $("#rounding").val();

    var averagesObject = getAverageArraysForPacketsArray(arrayCodes, maxDifference, roundingTo);
    //console.log('bits detected');
    //console.log(averagesObject.arrayBits);


    $("#averages").val(averagesObject.averageArray);
    $("#preprocessedPackets").val(averagesObject.newIRCodeArray);


    var finalProtocolString = '';
    for (var i = 0; i < averagesObject.newIRCodeArray.length; i++) {
        var protocolValue = encoderTable[averagesObject.newIRCodeArray[i]];
        finalProtocolString +=protocolValue;
    } // for i
    $("#rawPseudoProtocolOutput").val(finalProtocolString);

    return true;
}


function getAverageArraysForPacketsArray(arrayCodesAll, userInputObject)
{
    maxDifference = userInputObject.maxDifference;
    roundingTo = userInputObject.roundingTo;
    var arrayCommon = [[]];
    //var maxDifference = $("#maxrange").val();
    //
    //for (var i = 2; i < arrayCodesAll.length-1; i++) {
    for (var i = 0; i < arrayCodesAll.length; i++) {
        var currentCode = arrayCodesAll[i];
        //console.log('current code ' + currentCode);
        var foundCommon = false;
        for (var x = 0; x < arrayCommon.length; x++) {
            var currentCommonArray = arrayCommon[x];
            //console.log('currentCommonArray x ' + x + ' - ' + currentCommonArray);
            if (!foundCommon) {
                if (currentCommonArray.length > 0) {
                    var firstValue = currentCommonArray[0];
                    var diff = Math.abs(firstValue - currentCode);
                    //console.log('diff ' + diff);
                    if (diff <= maxDifference) {
                        currentCommonArray.push(currentCode);
                        foundCommon = true;
                    }
                } else {
                    currentCommonArray.push(currentCode);
                    foundCommon = true;

                }
                //console.log(' AFTER currentCommonArray x ' + x + ' - ' + currentCommonArray);
            }
        }
        if (!foundCommon) {
            // add to new common bucket
            var newArray = [];
            newArray.push(currentCode);
            arrayCommon.push(newArray);
            //console.log('NOT FOUND ADDING NEW ARRAY VALUE ' + newArray );
        }
    }
    //console.log(arrayCommon);
    //$("#preprocessOutput").val(arrayCommon);
    // calculate average
    var averageArray = [];
    for (var x = 0; x < arrayCommon.length; x++) {
        var currentCommonArray = arrayCommon[x];
        var currentTotal = 0;
        for (var y = 0; y < currentCommonArray.length; y++) {
            currentTotal += parseInt(currentCommonArray[y]);
        }
        //console.log ('currentTotal ' + currentTotal);
        var avg = currentTotal/currentCommonArray.length;
        //var roundingTo = $("#rounding").val();
        avg = Math.round(avg/roundingTo)*roundingTo;
        averageArray.push(avg);
    }

    // calculate new array of IR codes
    var newIRCodeArray = [];
    for (var i = 0; i < arrayCodesAll.length; i++) {
        var currentCode = arrayCodesAll[i];
        var codeFound = false;
        for (var x = 0; x < arrayCommon.length; x++) {
            var currentCommonArray = arrayCommon[x];
            for (var y = 0; y < currentCommonArray.length; y++) {
                if (!codeFound) {
                    if (currentCode === currentCommonArray[y]) {
                        codeFound = true;
                        newIRCodeArray.push(averageArray[x]);
                    }
                }
            } // for y
        } // for x
    } // for i
    // calculate number of bits for protocol
    var protocolBitsArray = [];
    // ignoring footer and header
    for (var i = 2; i < newIRCodeArray.length-1; i++) {
        var currentBit = newIRCodeArray[i] +'-'+newIRCodeArray[i+1];
        i++;
        var codeFound = false;
        for (var x = 0; x < protocolBitsArray.length; x++) {
            var existingBit = protocolBitsArray[x];
            if (existingBit === currentBit) {
                codeFound = true;
                break;
            }
        } // for x
        if (!codeFound) {
            protocolBitsArray.push(currentBit);
        }
    } // for i
    //console.log(protocolBitsArray);
    /*
    // check if header is also a bit. if used later on, include in protocolBitsArray
    var headerBit = newIRCodeArray[0] +'-'+newIRCodeArray[1];
    console.log(headerBitFoundInArray);
    var headerBitFoundInArray = false;
    for (var x = 0; x < protocolBitsArray.length; x++) {
        var existingBit = protocolBitsArray[x];
        if (existingBit === headerBit) {
            headerBitFoundInArray = true;
            break;
        }
    } // for x
    if (headerBitFoundInArray) {
        protocolBitsArray.push(headerBit);
    }

    console.log(protocolBitsArray);
    */
    /*
    arrayBits.sort(function sort(a, b) {
        var aArray = a.split('-');
        var bArray = b.split('-');

        var aVal1 = aArray[0];
        var bVal1 = bArray[0];
        var aVal2 = aArray[1];
        var bVal2 = bArray[1];
        var _a = "".concat(aVal1.padStart(10,'0'), aVal2.padStart(10,'0'));
        var _b = "".concat(bVal1.padStart(10,'0'), bVal2.padStart(10,'0'));
        //console.log(_a + ' -  ' + _b);
        if (_a < _b) {
            return -1;
        } else {
            return 1;
        }
    });
     */
    //console.log('after sort');
    //console.log(arrayBits);

    return { arrayCommon, averageArray, newIRCodeArray, protocolBitsArray, protocolNumberOfBits: protocolBitsArray.length };
}



function doProntoLogic()
{
    var prontoCodes = $("#inputIRPronto").val();
    prontoCodes = prontoCodes.trim();
    var prontoArray = prontoCodes.split(' ');

    var ignorePairsHeader = $("#numHeadersToIgnore").val();
    var ignorePairsFooter = $("#numFootersToIgnore").val();

    var prontoPreprocessedArray = [];
    var counter = 0;
    for (var i = (ignorePairsHeader*2); i < (prontoArray.length - (ignorePairsFooter*2)); i++) {
        prontoPreprocessedArray[counter] = prontoArray[i];
        counter++;
    }
    $("#preprocessOutputPronto").val("Hex Values:\n" + prontoPreprocessedArray);

    var prontoDecimalArray = [];
    for (var i = 0; i < prontoPreprocessedArray.length; i++) {
        prontoDecimalArray[i] = parseInt(prontoPreprocessedArray[i],16);
    }

    $("#preprocessOutputPronto").val(  $("#preprocessOutputPronto").val() + '\nDecimal Values:\n' +   prontoDecimalArray);

    // get bits
    var bits = '';
    for (var i = 0; i < (prontoDecimalArray.length - 1); i+=2) {
        console.log(i);
        var pair = [];
        pair.push(prontoDecimalArray[i]);
        pair.push(prontoDecimalArray[i+1]);
        console.log('pair ' + pair);
        bits += calculateZeroOrOne(pair, 'none');
    }
    // show bits on page
    var bitsMessage = bits + ' - ' + bits.length + ' bits';
    var currentBitsOutput = $("#resultBitsPronto").val();
    if (currentBitsOutput.length>0) {
        $("#resultBitsPronto").val( currentBitsOutput + '\n' + bitsMessage);
    } else {
        $("#resultBitsPronto").val( bitsMessage);
    }
    //$("#resultBitsPronto").val( bits + ' - ' + bits.length + ' bits');
    // get protocol
    var protocolCommand = getProtocolFromBits(bits);
    var currentCommandPronto = $("#resultProtocolPronto").val( );
    if (currentCommandPronto.length>0){
        $("#resultProtocolPronto").val( currentCommandPronto + '\n' + protocolCommand);
    } else {
        $("#resultProtocolPronto").val( protocolCommand);
    }

    return true;
}

function getProtocolFromBits(bits)
{
    // now find protocol
    var protocolString = "";
    var lastChar = "";
    var currentSequence = "";
    for (var i = 0; i < bits.length; i++) {
        var currentChar = bits.charAt(i);
        //console.log(currentChar + " -- " + lastChar);
        if (currentChar === lastChar || i === 0) {
            currentSequence += currentChar;
        } else {
            // bit changed
            protocolString += getProtocolLetter(currentSequence);
            currentSequence = currentChar;
        }
        lastChar = currentChar;
        //console.log(currentChar);
    }
    // take care of last chars
    if (currentSequence.length > 0) {
        protocolString += getProtocolLetter(currentSequence);
    }

    return protocolString;
}

function getUserInputStandard()
{
    var userInputObject = {};
    userInputObject.maxDifference = document.getElementById("maxDifStandard").value;
    userInputObject.roundingTo = document.getElementById("roundingStandard").value;
    userInputObject.noHeader = document.getElementById("noheader").value;
    userInputObject.noFooter = document.getElementById("nofooter").value;

    return userInputObject;
}
var protocolLetters2Bit = [
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"], // bit 0
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]  // bit 1
];
var protocolLetters4Bit = [
    ['a','b','c','d','e','f','g','h','i','j','k','l','m'],
    ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
    ['n','o','p','q','r','s','t','u','v','w','x','y','z'],
    ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
];
var protocolLetters6Bit = [
    ['a','b','c','d','e','f','g','h','i'], // bit 0
    ['A','B','C','D','E','F','G','H','I'], // bit 1
    ['j','k','l','m','n','o','p','q','r'], // bit 2
    ['J','K','L','M','N','O','P','Q','R'], // bit 3
    ['s','t','u','v','w','x','y','z','-'], // bit 4
    ['S','T','U','V','W','X','Y','Z','-']  // bit 5
];

var zerosLetters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var onesLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

var encoderTable = {
    0: '00', 5: '0A', 10: '0B', 15: '0C', 20: '0D', 25: '0E', 30: '0F', 35: '0G', 40: '0H', 45: '0I',
    50: '0J', 55: '0K', 60: '0L', 65: '0M', 70: '0N', 75: '0O', 80: '0P', 85: '0Q', 90: '0R', 95: '0S',
    100: '0T', 105: '0U', 110: '0V', 115: '0W', 120: '0X', 125: '0Y', 130: '0Z', 135: '0a', 140: '0b', 145: '0c',
    150: '0d', 155: '0e', 160: '0f', 165: '0g', 170: '0h', 175: '0i', 180: '0j', 185: '0k', 190: '0l', 195: '0m',
    200: '0n', 205: '0o', 210: '0p', 215: '0q', 220: '0r', 225: '0s', 230: '0t', 235: '0u', 240: '0v', 245: '0w',
    250: '0x', 255: '0y', 260: '0z', 265: '01', 270: '02', 275: '03', 280: '04', 285: '05', 290: '06', 295: '07',
    300: '08', 305: '09', 310: '0+', 315: '0/', 320: '0!', 325: '0@', 330: '0#', 335: '0$', 340: '0%', 345: '0&',
    350: '0(', 355: '0)', 360: '0=', 365: '0?', 370: '0*', 375: '0,', 380: '0.', 385: '0;', 390: '0:', 395: '0-',
    400: '0_', 405: '0<', 410: '0>', 415: 'A0', 420: 'AA', 425: 'AB', 430: 'AC', 435: 'AD', 440: 'AE', 445: 'AF',
    450: 'AG', 455: 'AH', 460: 'AI', 465: 'AJ', 470: 'AK', 475: 'AL', 480: 'AM', 485: 'AN', 490: 'AO', 495: 'AP',
    500: 'AQ', 505: 'AR', 510: 'AS', 515: 'AT', 520: 'AU', 525: 'AV', 530: 'AW', 535: 'AX', 540: 'AY', 545: 'AZ',
    550: 'Aa', 555: 'Ab', 560: 'Ac', 565: 'Ad', 570: 'Ae', 575: 'Af', 580: 'Ag', 585: 'Ah', 590: 'Ai', 595: 'Aj',
    600: 'Ak', 605: 'Al', 610: 'Am', 615: 'An', 620: 'Ao', 625: 'Ap', 630: 'Aq', 635: 'Ar', 640: 'As', 645: 'At',
    650: 'Au', 655: 'Av', 660: 'Aw', 665: 'Ax', 670: 'Ay', 675: 'Az', 680: 'A1', 685: 'A2', 690: 'A3', 695: 'A4',
    700: 'A5', 705: 'A6', 710: 'A7', 715: 'A8', 720: 'A9', 725: 'A+', 730: 'A/', 735: 'A!', 740: 'A@', 745: 'A#',
    750: 'A$', 755: 'A%', 760: 'A&', 765: 'A(', 770: 'A)', 775: 'A=', 780: 'A?', 785: 'A*', 790: 'A,', 795: 'A.',
    800: 'A;', 805: 'A:', 810: 'A-', 815: 'A_', 820: 'A<', 825: 'A>', 830: 'B0', 835: 'BA', 840: 'BB', 845: 'BC',
    850: 'BD', 855: 'BE', 860: 'BF', 865: 'BG', 870: 'BH', 875: 'BI', 880: 'BJ', 885: 'BK', 890: 'BL', 895: 'BM',
    900: 'BN', 905: 'BO', 910: 'BP', 915: 'BQ', 920: 'BR', 925: 'BS', 930: 'BT', 935: 'BU', 940: 'BV', 945: 'BW',
    950: 'BX', 955: 'BY', 960: 'BZ', 965: 'Ba', 970: 'Bb', 975: 'Bc', 980: 'Bd', 985: 'Be', 990: 'Bf', 995: 'Bg',
    1000: 'Bh', 1005: 'Bi', 1010: 'Bj', 1015: 'Bk', 1020: 'Bl', 1025: 'Bm', 1030: 'Bn', 1035: 'Bo', 1040: 'Bp', 1045: 'Bq',
    1050: 'Br', 1055: 'Bs', 1060: 'Bt', 1065: 'Bu', 1070: 'Bv', 1075: 'Bw', 1080: 'Bx', 1085: 'By', 1090: 'Bz', 1095: 'B1',
    1100: 'B2', 1105: 'B3', 1110: 'B4', 1115: 'B5', 1120: 'B6', 1125: 'B7', 1130: 'B8', 1135: 'B9', 1140: 'B+', 1145: 'B/',
    1150: 'B!', 1155: 'B@', 1160: 'B#', 1165: 'B$', 1170: 'B%', 1175: 'B&', 1180: 'B(', 1185: 'B)', 1190: 'B=', 1195: 'B?',
    1200: 'B*', 1205: 'B,', 1210: 'B.', 1215: 'B;', 1220: 'B:', 1225: 'B-', 1230: 'B_', 1235: 'B<', 1240: 'B>', 1245: 'C0',
    1250: 'CA', 1255: 'CB', 1260: 'CC', 1265: 'CD', 1270: 'CE', 1275: 'CF', 1280: 'CG', 1285: 'CH', 1290: 'CI', 1295: 'CJ',
    1300: 'CK', 1305: 'CL', 1310: 'CM', 1315: 'CN', 1320: 'CO', 1325: 'CP', 1330: 'CQ', 1335: 'CR', 1340: 'CS', 1345: 'CT',
    1350: 'CU', 1355: 'CV', 1360: 'CW', 1365: 'CX', 1370: 'CY', 1375: 'CZ', 1380: 'Ca', 1385: 'Cb', 1390: 'Cc', 1395: 'Cd',
    1400: 'Ce', 1405: 'Cf', 1410: 'Cg', 1415: 'Ch', 1420: 'Ci', 1425: 'Cj', 1430: 'Ck', 1435: 'Cl', 1440: 'Cm', 1445: 'Cn',
    1450: 'Co', 1455: 'Cp', 1460: 'Cq', 1465: 'Cr', 1470: 'Cs', 1475: 'Ct', 1480: 'Cu', 1485: 'Cv', 1490: 'Cw', 1495: 'Cx',
    1500: 'Cy', 1505: 'Cz', 1510: 'C1', 1515: 'C2', 1520: 'C3', 1525: 'C4', 1530: 'C5', 1535: 'C6', 1540: 'C7', 1545: 'C8',
    1550: 'C9', 1555: 'C+', 1560: 'C/', 1565: 'C!', 1570: 'C@', 1575: 'C#', 1580: 'C$', 1585: 'C%', 1590: 'C&', 1595: 'C(',
    1600: 'C)', 1605: 'C=', 1610: 'C?', 1615: 'C*', 1620: 'C,', 1625: 'C.', 1630: 'C;', 1635: 'C:', 1640: 'C-', 1645: 'C_',
    1650: 'C<', 1655: 'C>', 1660: 'D0', 1665: 'DA', 1670: 'DB', 1675: 'DC', 1680: 'DD', 1685: 'DE', 1690: 'DF', 1695: 'DG',
    1700: 'DH', 1705: 'DI', 1710: 'DJ', 1715: 'DK', 1720: 'DL', 1725: 'DM', 1730: 'DN', 1735: 'DO', 1740: 'DP', 1745: 'DQ',
    1750: 'DR', 1755: 'DS', 1760: 'DT', 1765: 'DU', 1770: 'DV', 1775: 'DW', 1780: 'DX', 1785: 'DY', 1790: 'DZ', 1795: 'Da',
    1800: 'Db', 1805: 'Dc', 1810: 'Dd', 1815: 'De', 1820: 'Df', 1825: 'Dg', 1830: 'Dh', 1835: 'Di', 1840: 'Dj', 1845: 'Dk',
    1850: 'Dl', 1855: 'Dm', 1860: 'Dn', 1865: 'Do', 1870: 'Dp', 1875: 'Dq', 1880: 'Dr', 1885: 'Ds', 1890: 'Dt', 1895: 'Du',
    1900: 'Dv', 1905: 'Dw', 1910: 'Dx', 1915: 'Dy', 1920: 'Dz', 1925: 'D1', 1930: 'D2', 1935: 'D3', 1940: 'D4', 1945: 'D5',
    1950: 'D6', 1955: 'D7', 1960: 'D8', 1965: 'D9', 1970: 'D+', 1975: 'D/', 1980: 'D!', 1985: 'D@', 1990: 'D#', 1995: 'D$',
    2000: 'D%', 2005: 'D&', 2010: 'D(', 2015: 'D)', 2020: 'D=', 2025: 'D?', 2030: 'D*', 2035: 'D,', 2040: 'D.', 2045: 'D;',
    2050: 'D:', 2055: 'D-', 2060: 'D_', 2065: 'D<', 2070: 'D>', 2075: 'E0', 2080: 'EA', 2085: 'EB', 2090: 'EC', 2095: 'ED',
    2100: 'EE', 2105: 'EF', 2110: 'EG', 2115: 'EH', 2120: 'EI', 2125: 'EJ', 2130: 'EK', 2135: 'EL', 2140: 'EM', 2145: 'EN',
    2150: 'EO', 2155: 'EP', 2160: 'EQ', 2165: 'ER', 2170: 'ES', 2175: 'ET', 2180: 'EU', 2185: 'EV', 2190: 'EW', 2195: 'EX',
    2200: 'EY', 2205: 'EZ', 2210: 'Ea', 2215: 'Eb', 2220: 'Ec', 2225: 'Ed', 2230: 'Ee', 2235: 'Ef', 2240: 'Eg', 2245: 'Eh',
    2250: 'Ei', 2255: 'Ej', 2260: 'Ek', 2265: 'El', 2270: 'Em', 2275: 'En', 2280: 'Eo', 2285: 'Ep', 2290: 'Eq', 2295: 'Er',
    2300: 'Es', 2305: 'Et', 2310: 'Eu', 2315: 'Ev', 2320: 'Ew', 2325: 'Ex', 2330: 'Ey', 2335: 'Ez', 2340: 'E1', 2345: 'E2',
    2350: 'E3', 2355: 'E4', 2360: 'E5', 2365: 'E6', 2370: 'E7', 2375: 'E8', 2380: 'E9', 2385: 'E+', 2390: 'E/', 2395: 'E!',
    2400: 'E@', 2405: 'E#', 2410: 'E$', 2415: 'E%', 2420: 'E&', 2425: 'E(', 2430: 'E)', 2435: 'E=', 2440: 'E?', 2445: 'E*',
    2450: 'E,', 2455: 'E.', 2460: 'E;', 2465: 'E:', 2470: 'E-', 2475: 'E_', 2480: 'E<', 2485: 'E>', 2490: 'F0', 2495: 'FA',
    2500: 'FB', 2505: 'FC', 2510: 'FD', 2515: 'FE', 2520: 'FF', 2525: 'FG', 2530: 'FH', 2535: 'FI', 2540: 'FJ', 2545: 'FK',
    2550: 'FL', 2555: 'FM', 2560: 'FN', 2565: 'FO', 2570: 'FP', 2575: 'FQ', 2580: 'FR', 2585: 'FS', 2590: 'FT', 2595: 'FU',
    2600: 'FV', 2605: 'FW', 2610: 'FX', 2615: 'FY', 2620: 'FZ', 2625: 'Fa', 2630: 'Fb', 2635: 'Fc', 2640: 'Fd', 2645: 'Fe',
    2650: 'Ff', 2655: 'Fg', 2660: 'Fh', 2665: 'Fi', 2670: 'Fj', 2675: 'Fk', 2680: 'Fl', 2685: 'Fm', 2690: 'Fn', 2695: 'Fo',
    2700: 'Fp', 2705: 'Fq', 2710: 'Fr', 2715: 'Fs', 2720: 'Ft', 2725: 'Fu', 2730: 'Fv', 2735: 'Fw', 2740: 'Fx', 2745: 'Fy',
    2750: 'Fz', 2755: 'F1', 2760: 'F2', 2765: 'F3', 2770: 'F4', 2775: 'F5', 2780: 'F6', 2785: 'F7', 2790: 'F8', 2795: 'F9',
    2800: 'F+', 2805: 'F/', 2810: 'F!', 2815: 'F@', 2820: 'F#', 2825: 'F$', 2830: 'F%', 2835: 'F&', 2840: 'F(', 2845: 'F)',
    2850: 'F=', 2855: 'F?', 2860: 'F*', 2865: 'F,', 2870: 'F.', 2875: 'F;', 2880: 'F:', 2885: 'F-', 2890: 'F_', 2895: 'F<',
    2900: 'F>', 2905: 'G0', 2910: 'GA', 2915: 'GB', 2920: 'GC', 2925: 'GD', 2930: 'GE', 2935: 'GF', 2940: 'GG', 2945: 'GH',
    2950: 'GI', 2955: 'GJ', 2960: 'GK', 2965: 'GL', 2970: 'GM', 2975: 'GN', 2980: 'GO', 2985: 'GP', 2990: 'GQ', 2995: 'GR',
    3000: 'GS', 3005: 'GT', 3010: 'GU', 3015: 'GV', 3020: 'GW', 3025: 'GX', 3030: 'GY', 3035: 'GZ', 3040: 'Ga', 3045: 'Gb',
    3050: 'Gc', 3055: 'Gd', 3060: 'Ge', 3065: 'Gf', 3070: 'Gg', 3075: 'Gh', 3080: 'Gi', 3085: 'Gj', 3090: 'Gk', 3095: 'Gl',
    3100: 'Gm', 3105: 'Gn', 3110: 'Go', 3115: 'Gp', 3120: 'Gq', 3125: 'Gr', 3130: 'Gs', 3135: 'Gt', 3140: 'Gu', 3145: 'Gv',
    3150: 'Gw', 3155: 'Gx', 3160: 'Gy', 3165: 'Gz', 3170: 'G1', 3175: 'G2', 3180: 'G3', 3185: 'G4', 3190: 'G5', 3195: 'G6',
    3200: 'G7', 3205: 'G8', 3210: 'G9', 3215: 'G+', 3220: 'G/', 3225: 'G!', 3230: 'G@', 3235: 'G#', 3240: 'G$', 3245: 'G%',
    3250: 'G&', 3255: 'G(', 3260: 'G)', 3265: 'G=', 3270: 'G?', 3275: 'G*', 3280: 'G,', 3285: 'G.', 3290: 'G;', 3295: 'G:',
    3300: 'G-', 3305: 'G_', 3310: 'G<', 3315: 'G>', 3320: 'H0', 3325: 'HA', 3330: 'HB', 3335: 'HC', 3340: 'HD', 3345: 'HE',
    3350: 'HF', 3355: 'HG', 3360: 'HH', 3365: 'HI', 3370: 'HJ', 3375: 'HK', 3380: 'HL', 3385: 'HM', 3390: 'HN', 3395: 'HO',
    3400: 'HP', 3405: 'HQ', 3410: 'HR', 3415: 'HS', 3420: 'HT', 3425: 'HU', 3430: 'HV', 3435: 'HW', 3440: 'HX', 3445: 'HY',
    3450: 'HZ', 3455: 'Ha', 3460: 'Hb', 3465: 'Hc', 3470: 'Hd', 3475: 'He', 3480: 'Hf', 3485: 'Hg', 3490: 'Hh', 3495: 'Hi',
    3500: 'Hj', 3505: 'Hk', 3510: 'Hl', 3515: 'Hm', 3520: 'Hn', 3525: 'Ho', 3530: 'Hp', 3535: 'Hq', 3540: 'Hr', 3545: 'Hs',
    3550: 'Ht', 3555: 'Hu', 3560: 'Hv', 3565: 'Hw', 3570: 'Hx', 3575: 'Hy', 3580: 'Hz', 3585: 'H1', 3590: 'H2', 3595: 'H3',
    3600: 'H4', 3605: 'H5', 3610: 'H6', 3615: 'H7', 3620: 'H8', 3625: 'H9', 3630: 'H+', 3635: 'H/', 3640: 'H!', 3645: 'H@',
    3650: 'H#', 3655: 'H$', 3660: 'H%', 3665: 'H&', 3670: 'H(', 3675: 'H)', 3680: 'H=', 3685: 'H?', 3690: 'H*', 3695: 'H,',
    3700: 'H.', 3705: 'H;', 3710: 'H:', 3715: 'H-', 3720: 'H_', 3725: 'H<', 3730: 'H>', 3735: 'I0', 3740: 'IA', 3745: 'IB',
    3750: 'IC', 3755: 'ID', 3760: 'IE', 3765: 'IF', 3770: 'IG', 3775: 'IH', 3780: 'II', 3785: 'IJ', 3790: 'IK', 3795: 'IL',
    3800: 'IM', 3805: 'IN', 3810: 'IO', 3815: 'IP', 3820: 'IQ', 3825: 'IR', 3830: 'IS', 3835: 'IT', 3840: 'IU', 3845: 'IV',
    3850: 'IW', 3855: 'IX', 3860: 'IY', 3865: 'IZ', 3870: 'Ia', 3875: 'Ib', 3880: 'Ic', 3885: 'Id', 3890: 'Ie', 3895: 'If',
    3900: 'Ig', 3905: 'Ih', 3910: 'Ii', 3915: 'Ij', 3920: 'Ik', 3925: 'Il', 3930: 'Im', 3935: 'In', 3940: 'Io', 3945: 'Ip',
    3950: 'Iq', 3955: 'Ir', 3960: 'Is', 3965: 'It', 3970: 'Iu', 3975: 'Iv', 3980: 'Iw', 3985: 'Ix', 3990: 'Iy', 3995: 'Iz',
    4000: 'I1', 4005: 'I2', 4010: 'I3', 4015: 'I4', 4020: 'I5', 4025: 'I6', 4030: 'I7', 4035: 'I8', 4040: 'I9', 4045: 'I+',
    4050: 'I/', 4055: 'I!', 4060: 'I@', 4065: 'I#', 4070: 'I$', 4075: 'I%', 4080: 'I&', 4085: 'I(', 4090: 'I)', 4095: 'I=',
    4100: 'I?', 4105: 'I*', 4110: 'I,', 4115: 'I.', 4120: 'I;', 4125: 'I:', 4130: 'I-', 4135: 'I_', 4140: 'I<', 4145: 'I>',
    4150: 'J0', 4155: 'JA', 4160: 'JB', 4165: 'JC', 4170: 'JD', 4175: 'JE', 4180: 'JF', 4185: 'JG', 4190: 'JH', 4195: 'JI',
    4200: 'JJ', 4205: 'JK', 4210: 'JL', 4215: 'JM', 4220: 'JN', 4225: 'JO', 4230: 'JP', 4235: 'JQ', 4240: 'JR', 4245: 'JS',
    4250: 'JT', 4255: 'JU', 4260: 'JV', 4265: 'JW', 4270: 'JX', 4275: 'JY', 4280: 'JZ', 4285: 'Ja', 4290: 'Jb', 4295: 'Jc',
    4300: 'Jd', 4305: 'Je', 4310: 'Jf', 4315: 'Jg', 4320: 'Jh', 4325: 'Ji', 4330: 'Jj', 4335: 'Jk', 4340: 'Jl', 4345: 'Jm',
    4350: 'Jn', 4355: 'Jo', 4360: 'Jp', 4365: 'Jq', 4370: 'Jr', 4375: 'Js', 4380: 'Jt', 4385: 'Ju', 4390: 'Jv', 4395: 'Jw',
    4400: 'Jx', 4405: 'Jy', 4410: 'Jz', 4415: 'J1', 4420: 'J2', 4425: 'J3', 4430: 'J4', 4435: 'J5', 4440: 'J6', 4445: 'J7',
    4450: 'J8', 4455: 'J9', 4460: 'J+', 4465: 'J/', 4470: 'J!', 4475: 'J@', 4480: 'J#', 4485: 'J$', 4490: 'J%', 4495: 'J&',
    4500: 'J(', 4505: 'J)', 4510: 'J=', 4515: 'J?', 4520: 'J*', 4525: 'J,', 4530: 'J.', 4535: 'J;', 4540: 'J:', 4545: 'J-',
    4550: 'J_', 4555: 'J<', 4560: 'J>', 4565: 'K0', 4570: 'KA', 4575: 'KB', 4580: 'KC', 4585: 'KD', 4590: 'KE', 4595: 'KF',
    4600: 'KG', 4605: 'KH', 4610: 'KI', 4615: 'KJ', 4620: 'KK', 4625: 'KL', 4630: 'KM', 4635: 'KN', 4640: 'KO', 4645: 'KP',
    4650: 'KQ', 4655: 'KR', 4660: 'KS', 4665: 'KT', 4670: 'KU', 4675: 'KV', 4680: 'KW', 4685: 'KX', 4690: 'KY', 4695: 'KZ',
    4700: 'Ka', 4705: 'Kb', 4710: 'Kc', 4715: 'Kd', 4720: 'Ke', 4725: 'Kf', 4730: 'Kg', 4735: 'Kh', 4740: 'Ki', 4745: 'Kj',
    4750: 'Kk', 4755: 'Kl', 4760: 'Km', 4765: 'Kn', 4770: 'Ko', 4775: 'Kp', 4780: 'Kq', 4785: 'Kr', 4790: 'Ks', 4795: 'Kt',
    4800: 'Ku', 4805: 'Kv', 4810: 'Kw', 4815: 'Kx', 4820: 'Ky', 4825: 'Kz', 4830: 'K1', 4835: 'K2', 4840: 'K3', 4845: 'K4',
    4850: 'K5', 4855: 'K6', 4860: 'K7', 4865: 'K8', 4870: 'K9', 4875: 'K+', 4880: 'K/', 4885: 'K!', 4890: 'K@', 4895: 'K#',
    4900: 'K$', 4905: 'K%', 4910: 'K&', 4915: 'K(', 4920: 'K)', 4925: 'K=', 4930: 'K?', 4935: 'K*', 4940: 'K,', 4945: 'K.',
    4950: 'K;', 4955: 'K:', 4960: 'K-', 4965: 'K_', 4970: 'K<', 4975: 'K>', 4980: 'L0', 4985: 'LA', 4990: 'LB', 4995: 'LC',
    5000: 'LD', 5005: 'LE', 5010: 'LF', 5015: 'LG', 5020: 'LH', 5025: 'LI', 5030: 'LJ', 5035: 'LK', 5040: 'LL', 5045: 'LM',
    5050: 'LN', 5055: 'LO', 5060: 'LP', 5065: 'LQ', 5070: 'LR', 5075: 'LS', 5080: 'LT', 5085: 'LU', 5090: 'LV', 5095: 'LW',
    5100: 'LX', 5105: 'LY', 5110: 'LZ', 5115: 'La', 5120: 'Lb', 5125: 'Lc', 5130: 'Ld', 5135: 'Le', 5140: 'Lf', 5145: 'Lg',
    5150: 'Lh', 5155: 'Li', 5160: 'Lj', 5165: 'Lk', 5170: 'Ll', 5175: 'Lm', 5180: 'Ln', 5185: 'Lo', 5190: 'Lp', 5195: 'Lq',
    5200: 'Lr', 5205: 'Ls', 5210: 'Lt', 5215: 'Lu', 5220: 'Lv', 5225: 'Lw', 5230: 'Lx', 5235: 'Ly', 5240: 'Lz', 5245: 'L1',
    5250: 'L2', 5255: 'L3', 5260: 'L4', 5265: 'L5', 5270: 'L6', 5275: 'L7', 5280: 'L8', 5285: 'L9', 5290: 'L+', 5295: 'L/',
    5300: 'L!', 5305: 'L@', 5310: 'L#', 5315: 'L$', 5320: 'L%', 5325: 'L&', 5330: 'L(', 5335: 'L)', 5340: 'L=', 5345: 'L?',
    5350: 'L*', 5355: 'L,', 5360: 'L.', 5365: 'L;', 5370: 'L:', 5375: 'L-', 5380: 'L_', 5385: 'L<', 5390: 'L>', 5395: 'M0',
    5400: 'MA', 5405: 'MB', 5410: 'MC', 5415: 'MD', 5420: 'ME', 5425: 'MF', 5430: 'MG', 5435: 'MH', 5440: 'MI', 5445: 'MJ',
    5450: 'MK', 5455: 'ML', 5460: 'MM', 5465: 'MN', 5470: 'MO', 5475: 'MP', 5480: 'MQ', 5485: 'MR', 5490: 'MS', 5495: 'MT',
    5500: 'MU', 5505: 'MV', 5510: 'MW', 5515: 'MX', 5520: 'MY', 5525: 'MZ', 5530: 'Ma', 5535: 'Mb', 5540: 'Mc', 5545: 'Md',
    5550: 'Me', 5555: 'Mf', 5560: 'Mg', 5565: 'Mh', 5570: 'Mi', 5575: 'Mj', 5580: 'Mk', 5585: 'Ml', 5590: 'Mm', 5595: 'Mn',
    5600: 'Mo', 5605: 'Mp', 5610: 'Mq', 5615: 'Mr', 5620: 'Ms', 5625: 'Mt', 5630: 'Mu', 5635: 'Mv', 5640: 'Mw', 5645: 'Mx',
    5650: 'My', 5655: 'Mz', 5660: 'M1', 5665: 'M2', 5670: 'M3', 5675: 'M4', 5680: 'M5', 5685: 'M6', 5690: 'M7', 5695: 'M8',
    5700: 'M9', 5705: 'M+', 5710: 'M/', 5715: 'M!', 5720: 'M@', 5725: 'M#', 5730: 'M$', 5735: 'M%', 5740: 'M&', 5745: 'M(',
    5750: 'M)', 5755: 'M=', 5760: 'M?', 5765: 'M*', 5770: 'M,', 5775: 'M.', 5780: 'M;', 5785: 'M:', 5790: 'M-', 5795: 'M_',
    5800: 'M<', 5805: 'M>', 5810: 'N0', 5815: 'NA', 5820: 'NB', 5825: 'NC', 5830: 'ND', 5835: 'NE', 5840: 'NF', 5845: 'NG',
    5850: 'NH', 5855: 'NI', 5860: 'NJ', 5865: 'NK', 5870: 'NL', 5875: 'NM', 5880: 'NN', 5885: 'NO', 5890: 'NP', 5895: 'NQ',
    5900: 'NR', 5905: 'NS', 5910: 'NT', 5915: 'NU', 5920: 'NV', 5925: 'NW', 5930: 'NX', 5935: 'NY', 5940: 'NZ', 5945: 'Na',
    5950: 'Nb', 5955: 'Nc', 5960: 'Nd', 5965: 'Ne', 5970: 'Nf', 5975: 'Ng', 5980: 'Nh', 5985: 'Ni', 5990: 'Nj', 5995: 'Nk',
    6000: 'Nl', 6005: 'Nm', 6010: 'Nn', 6015: 'No', 6020: 'Np', 6025: 'Nq', 6030: 'Nr', 6035: 'Ns', 6040: 'Nt', 6045: 'Nu',
    6050: 'Nv', 6055: 'Nw', 6060: 'Nx', 6065: 'Ny', 6070: 'Nz', 6075: 'N1', 6080: 'N2', 6085: 'N3', 6090: 'N4', 6095: 'N5',
    6100: 'N6', 6105: 'N7', 6110: 'N8', 6115: 'N9', 6120: 'N+', 6125: 'N/', 6130: 'N!', 6135: 'N@', 6140: 'N#', 6145: 'N$',
    6150: 'N%', 6155: 'N&', 6160: 'N(', 6165: 'N)', 6170: 'N=', 6175: 'N?', 6180: 'N*', 6185: 'N,', 6190: 'N.', 6195: 'N;',
    6200: 'N:', 6205: 'N-', 6210: 'N_', 6215: 'N<', 6220: 'N>', 6225: 'O0', 6230: 'OA', 6235: 'OB', 6240: 'OC', 6245: 'OD',
    6250: 'OE', 6255: 'OF', 6260: 'OG', 6265: 'OH', 6270: 'OI', 6275: 'OJ', 6280: 'OK', 6285: 'OL', 6290: 'OM', 6295: 'ON',
    6300: 'OO', 6305: 'OP', 6310: 'OQ', 6315: 'OR', 6320: 'OS', 6325: 'OT', 6330: 'OU', 6335: 'OV', 6340: 'OW', 6345: 'OX',
    6350: 'OY', 6355: 'OZ', 6360: 'Oa', 6365: 'Ob', 6370: 'Oc', 6375: 'Od', 6380: 'Oe', 6385: 'Of', 6390: 'Og', 6395: 'Oh',
    6400: 'Oi', 6405: 'Oj', 6410: 'Ok', 6415: 'Ol', 6420: 'Om', 6425: 'On', 6430: 'Oo', 6435: 'Op', 6440: 'Oq', 6445: 'Or',
    6450: 'Os', 6455: 'Ot', 6460: 'Ou', 6465: 'Ov', 6470: 'Ow', 6475: 'Ox', 6480: 'Oy', 6485: 'Oz', 6490: 'O1', 6495: 'O2',
    6500: 'O3', 6505: 'O4', 6510: 'O5', 6515: 'O6', 6520: 'O7', 6525: 'O8', 6530: 'O9', 6535: 'O+', 6540: 'O/', 6545: 'O!',
    6550: 'O@', 6555: 'O#', 6560: 'O$', 6565: 'O%', 6570: 'O&', 6575: 'O(', 6580: 'O)', 6585: 'O=', 6590: 'O?', 6595: 'O*',
    6600: 'O,', 6605: 'O.', 6610: 'O;', 6615: 'O:', 6620: 'O-', 6625: 'O_', 6630: 'O<', 6635: 'O>', 6640: 'P0', 6645: 'PA',
    6650: 'PB', 6655: 'PC', 6660: 'PD', 6665: 'PE', 6670: 'PF', 6675: 'PG', 6680: 'PH', 6685: 'PI', 6690: 'PJ', 6695: 'PK',
    6700: 'PL', 6705: 'PM', 6710: 'PN', 6715: 'PO', 6720: 'PP', 6725: 'PQ', 6730: 'PR', 6735: 'PS', 6740: 'PT', 6745: 'PU',
    6750: 'PV', 6755: 'PW', 6760: 'PX', 6765: 'PY', 6770: 'PZ', 6775: 'Pa', 6780: 'Pb', 6785: 'Pc', 6790: 'Pd', 6795: 'Pe',
    6800: 'Pf', 6805: 'Pg', 6810: 'Ph', 6815: 'Pi', 6820: 'Pj', 6825: 'Pk', 6830: 'Pl', 6835: 'Pm', 6840: 'Pn', 6845: 'Po',
    6850: 'Pp', 6855: 'Pq', 6860: 'Pr', 6865: 'Ps', 6870: 'Pt', 6875: 'Pu', 6880: 'Pv', 6885: 'Pw', 6890: 'Px', 6895: 'Py',
    6900: 'Pz', 6905: 'P1', 6910: 'P2', 6915: 'P3', 6920: 'P4', 6925: 'P5', 6930: 'P6', 6935: 'P7', 6940: 'P8', 6945: 'P9',
    6950: 'P+', 6955: 'P/', 6960: 'P!', 6965: 'P@', 6970: 'P#', 6975: 'P$', 6980: 'P%', 6985: 'P&', 6990: 'P(', 6995: 'P)',
    7000: 'P=', 7005: 'P?', 7010: 'P*', 7015: 'P,', 7020: 'P.', 7025: 'P;', 7030: 'P:', 7035: 'P-', 7040: 'P_', 7045: 'P<',
    7050: 'P>', 7055: 'Q0', 7060: 'QA', 7065: 'QB', 7070: 'QC', 7075: 'QD', 7080: 'QE', 7085: 'QF', 7090: 'QG', 7095: 'QH',
    7100: 'QI', 7105: 'QJ', 7110: 'QK', 7115: 'QL', 7120: 'QM', 7125: 'QN', 7130: 'QO', 7135: 'QP', 7140: 'QQ', 7145: 'QR',
    7150: 'QS', 7155: 'QT', 7160: 'QU', 7165: 'QV', 7170: 'QW', 7175: 'QX', 7180: 'QY', 7185: 'QZ', 7190: 'Qa', 7195: 'Qb',
    7200: 'Qc', 7205: 'Qd', 7210: 'Qe', 7215: 'Qf', 7220: 'Qg', 7225: 'Qh', 7230: 'Qi', 7235: 'Qj', 7240: 'Qk', 7245: 'Ql',
    7250: 'Qm', 7255: 'Qn', 7260: 'Qo', 7265: 'Qp', 7270: 'Qq', 7275: 'Qr', 7280: 'Qs', 7285: 'Qt', 7290: 'Qu', 7295: 'Qv',
    7300: 'Qw', 7305: 'Qx', 7310: 'Qy', 7315: 'Qz', 7320: 'Q1', 7325: 'Q2', 7330: 'Q3', 7335: 'Q4', 7340: 'Q5', 7345: 'Q6',
    7350: 'Q7', 7355: 'Q8', 7360: 'Q9', 7365: 'Q+', 7370: 'Q/', 7375: 'Q!', 7380: 'Q@', 7385: 'Q#', 7390: 'Q$', 7395: 'Q%',
    7400: 'Q&', 7405: 'Q(', 7410: 'Q)', 7415: 'Q=', 7420: 'Q?', 7425: 'Q*', 7430: 'Q,', 7435: 'Q.', 7440: 'Q;', 7445: 'Q:',
    7450: 'Q-', 7455: 'Q_', 7460: 'Q<', 7465: 'Q>', 7470: 'R0', 7475: 'RA', 7480: 'RB', 7485: 'RC', 7490: 'RD', 7495: 'RE',
    7500: 'RF', 7505: 'RG', 7510: 'RH', 7515: 'RI', 7520: 'RJ', 7525: 'RK', 7530: 'RL', 7535: 'RM', 7540: 'RN', 7545: 'RO',
    7550: 'RP', 7555: 'RQ', 7560: 'RR', 7565: 'RS', 7570: 'RT', 7575: 'RU', 7580: 'RV', 7585: 'RW', 7590: 'RX', 7595: 'RY',
    7600: 'RZ', 7605: 'Ra', 7610: 'Rb', 7615: 'Rc', 7620: 'Rd', 7625: 'Re', 7630: 'Rf', 7635: 'Rg', 7640: 'Rh', 7645: 'Ri',
    7650: 'Rj', 7655: 'Rk', 7660: 'Rl', 7665: 'Rm', 7670: 'Rn', 7675: 'Ro', 7680: 'Rp', 7685: 'Rq', 7690: 'Rr', 7695: 'Rs',
    7700: 'Rt', 7705: 'Ru', 7710: 'Rv', 7715: 'Rw', 7720: 'Rx', 7725: 'Ry', 7730: 'Rz', 7735: 'R1', 7740: 'R2', 7745: 'R3',
    7750: 'R4', 7755: 'R5', 7760: 'R6', 7765: 'R7', 7770: 'R8', 7775: 'R9', 7780: 'R+', 7785: 'R/', 7790: 'R!', 7795: 'R@',
    7800: 'R#', 7805: 'R$', 7810: 'R%', 7815: 'R&', 7820: 'R(', 7825: 'R)', 7830: 'R=', 7835: 'R?', 7840: 'R*', 7845: 'R,',
    7850: 'R.', 7855: 'R;', 7860: 'R:', 7865: 'R-', 7870: 'R_', 7875: 'R<', 7880: 'R>', 7885: 'S0', 7890: 'SA', 7895: 'SB',
    7900: 'SC', 7905: 'SD', 7910: 'SE', 7915: 'SF', 7920: 'SG', 7925: 'SH', 7930: 'SI', 7935: 'SJ', 7940: 'SK', 7945: 'SL',
    7950: 'SM', 7955: 'SN', 7960: 'SO', 7965: 'SP', 7970: 'SQ', 7975: 'SR', 7980: 'SS', 7985: 'ST', 7990: 'SU', 7995: 'SV',
    8000: 'SW', 8005: 'SX', 8010: 'SY', 8015: 'SZ', 8020: 'Sa', 8025: 'Sb', 8030: 'Sc', 8035: 'Sd', 8040: 'Se', 8045: 'Sf',
    8050: 'Sg', 8055: 'Sh', 8060: 'Si', 8065: 'Sj', 8070: 'Sk', 8075: 'Sl', 8080: 'Sm', 8085: 'Sn', 8090: 'So', 8095: 'Sp',
    8100: 'Sq', 8105: 'Sr', 8110: 'Ss', 8115: 'St', 8120: 'Su', 8125: 'Sv', 8130: 'Sw', 8135: 'Sx', 8140: 'Sy', 8145: 'Sz',
    8150: 'S1', 8155: 'S2', 8160: 'S3', 8165: 'S4', 8170: 'S5', 8175: 'S6', 8180: 'S7', 8185: 'S8', 8190: 'S9', 8195: 'S+',
    8200: 'S/', 8205: 'S!', 8210: 'S@', 8215: 'S#', 8220: 'S$', 8225: 'S%', 8230: 'S&', 8235: 'S(', 8240: 'S)', 8245: 'S=',
    8250: 'S?', 8255: 'S*', 8260: 'S,', 8265: 'S.', 8270: 'S;', 8275: 'S:', 8280: 'S-', 8285: 'S_', 8290: 'S<', 8295: 'S>',
    8300: 'T0', 8305: 'TA', 8310: 'TB', 8315: 'TC', 8320: 'TD', 8325: 'TE', 8330: 'TF', 8335: 'TG', 8340: 'TH', 8345: 'TI',
    8350: 'TJ', 8355: 'TK', 8360: 'TL', 8365: 'TM', 8370: 'TN', 8375: 'TO', 8380: 'TP', 8385: 'TQ', 8390: 'TR', 8395: 'TS',
    8400: 'TT', 8405: 'TU', 8410: 'TV', 8415: 'TW', 8420: 'TX', 8425: 'TY', 8430: 'TZ', 8435: 'Ta', 8440: 'Tb', 8445: 'Tc',
    8450: 'Td', 8455: 'Te', 8460: 'Tf', 8465: 'Tg', 8470: 'Th', 8475: 'Ti', 8480: 'Tj', 8485: 'Tk', 8490: 'Tl', 8495: 'Tm',
    8500: 'Tn', 8505: 'To', 8510: 'Tp', 8515: 'Tq', 8520: 'Tr', 8525: 'Ts', 8530: 'Tt', 8535: 'Tu', 8540: 'Tv', 8545: 'Tw',
    8550: 'Tx', 8555: 'Ty', 8560: 'Tz', 8565: 'T1', 8570: 'T2', 8575: 'T3', 8580: 'T4', 8585: 'T5', 8590: 'T6', 8595: 'T7',
    8600: 'T8', 8605: 'T9', 8610: 'T+', 8615: 'T/', 8620: 'T!', 8625: 'T@', 8630: 'T#', 8635: 'T$', 8640: 'T%', 8645: 'T&',
    8650: 'T(', 8655: 'T)', 8660: 'T=', 8665: 'T?', 8670: 'T*', 8675: 'T,', 8680: 'T.', 8685: 'T;', 8690: 'T:', 8695: 'T-',
    8700: 'T_', 8705: 'T<', 8710: 'T>', 8715: 'U0', 8720: 'UA', 8725: 'UB', 8730: 'UC', 8735: 'UD', 8740: 'UE', 8745: 'UF',
    8750: 'UG', 8755: 'UH', 8760: 'UI', 8765: 'UJ', 8770: 'UK', 8775: 'UL', 8780: 'UM', 8785: 'UN', 8790: 'UO', 8795: 'UP',
    8800: 'UQ', 8805: 'UR', 8810: 'US', 8815: 'UT', 8820: 'UU', 8825: 'UV', 8830: 'UW', 8835: 'UX', 8840: 'UY', 8845: 'UZ',
    8850: 'Ua', 8855: 'Ub', 8860: 'Uc', 8865: 'Ud', 8870: 'Ue', 8875: 'Uf', 8880: 'Ug', 8885: 'Uh', 8890: 'Ui', 8895: 'Uj',
    8900: 'Uk', 8905: 'Ul', 8910: 'Um', 8915: 'Un', 8920: 'Uo', 8925: 'Up', 8930: 'Uq', 8935: 'Ur', 8940: 'Us', 8945: 'Ut',
    8950: 'Uu', 8955: 'Uv', 8960: 'Uw', 8965: 'Ux', 8970: 'Uy', 8975: 'Uz', 8980: 'U1', 8985: 'U2', 8990: 'U3', 8995: 'U4',
    9000: 'U5', 9005: 'U6', 9010: 'U7', 9015: 'U8', 9020: 'U9', 9025: 'U+', 9030: 'U/', 9035: 'U!', 9040: 'U@', 9045: 'U#',
    9050: 'U$', 9055: 'U%', 9060: 'U&', 9065: 'U(', 9070: 'U)', 9075: 'U=', 9080: 'U?', 9085: 'U*', 9090: 'U,', 9095: 'U.',
    9100: 'U;', 9105: 'U:', 9110: 'U-', 9115: 'U_', 9120: 'U<', 9125: 'U>', 9130: 'V0', 9135: 'VA', 9140: 'VB', 9145: 'VC',
    9150: 'VD', 9155: 'VE', 9160: 'VF', 9165: 'VG', 9170: 'VH', 9175: 'VI', 9180: 'VJ', 9185: 'VK', 9190: 'VL', 9195: 'VM',
    9200: 'VN', 9205: 'VO', 9210: 'VP', 9215: 'VQ', 9220: 'VR', 9225: 'VS', 9230: 'VT', 9235: 'VU', 9240: 'VV', 9245: 'VW',
    9250: 'VX', 9255: 'VY', 9260: 'VZ', 9265: 'Va', 9270: 'Vb', 9275: 'Vc', 9280: 'Vd', 9285: 'Ve', 9290: 'Vf', 9295: 'Vg',
    9300: 'Vh', 9305: 'Vi', 9310: 'Vj', 9315: 'Vk', 9320: 'Vl', 9325: 'Vm', 9330: 'Vn', 9335: 'Vo', 9340: 'Vp', 9345: 'Vq',
    9350: 'Vr', 9355: 'Vs', 9360: 'Vt', 9365: 'Vu', 9370: 'Vv', 9375: 'Vw', 9380: 'Vx', 9385: 'Vy', 9390: 'Vz', 9395: 'V1',
    9400: 'V2', 9405: 'V3', 9410: 'V4', 9415: 'V5', 9420: 'V6', 9425: 'V7', 9430: 'V8', 9435: 'V9', 9440: 'V+', 9445: 'V/',
    9450: 'V!', 9455: 'V@', 9460: 'V#', 9465: 'V$', 9470: 'V%', 9475: 'V&', 9480: 'V(', 9485: 'V)', 9490: 'V=', 9495: 'V?',
    9500: 'V*', 9505: 'V,', 9510: 'V.', 9515: 'V;', 9520: 'V:', 9525: 'V-', 9530: 'V_', 9535: 'V<', 9540: 'V>', 9545: 'W0',
    9550: 'WA', 9555: 'WB', 9560: 'WC', 9565: 'WD', 9570: 'WE', 9575: 'WF', 9580: 'WG', 9585: 'WH', 9590: 'WI', 9595: 'WJ',
    9600: 'WK', 9605: 'WL', 9610: 'WM', 9615: 'WN', 9620: 'WO', 9625: 'WP', 9630: 'WQ', 9635: 'WR', 9640: 'WS', 9645: 'WT',
    9650: 'WU', 9655: 'WV', 9660: 'WW', 9665: 'WX', 9670: 'WY', 9675: 'WZ', 9680: 'Wa', 9685: 'Wb', 9690: 'Wc', 9695: 'Wd',
    9700: 'We', 9705: 'Wf', 9710: 'Wg', 9715: 'Wh', 9720: 'Wi', 9725: 'Wj', 9730: 'Wk', 9735: 'Wl', 9740: 'Wm', 9745: 'Wn',
    9750: 'Wo', 9755: 'Wp', 9760: 'Wq', 9765: 'Wr', 9770: 'Ws', 9775: 'Wt', 9780: 'Wu', 9785: 'Wv', 9790: 'Ww', 9795: 'Wx',
    9800: 'Wy', 9805: 'Wz', 9810: 'W1', 9815: 'W2', 9820: 'W3', 9825: 'W4', 9830: 'W5', 9835: 'W6', 9840: 'W7', 9845: 'W8',
    9850: 'W9', 9855: 'W+', 9860: 'W/', 9865: 'W!', 9870: 'W@', 9875: 'W#', 9880: 'W$', 9885: 'W%', 9890: 'W&', 9895: 'W(',
    9900: 'W)', 9905: 'W=', 9910: 'W?', 9915: 'W*', 9920: 'W,', 9925: 'W.', 9930: 'W;', 9935: 'W:', 9940: 'W-', 9945: 'W_',
    9950: 'W<', 9955: 'W>', 9960: 'X0', 9965: 'XA', 9970: 'XB', 9975: 'XC', 9980: 'XD', 9985: 'XE', 9990: 'XF', 9995: 'XG',
    10000: 'XH', 10005: 'XI', 10010: 'XJ', 10015: 'XK', 10020: 'XL', 10025: 'XM', 10030: 'XN', 10035: 'XO', 10040: 'XP', 10045: 'XQ',
    10050: 'XR', 10055: 'XS', 10060: 'XT', 10065: 'XU', 10070: 'XV', 10075: 'XW', 10080: 'XX', 10085: 'XY', 10090: 'XZ', 10095: 'Xa',
    10100: 'Xb', 10105: 'Xc', 10110: 'Xd', 10115: 'Xe', 10120: 'Xf', 10125: 'Xg', 10130: 'Xh', 10135: 'Xi', 10140: 'Xj', 10145: 'Xk',
    10150: 'Xl', 10155: 'Xm', 10160: 'Xn', 10165: 'Xo', 10170: 'Xp', 10175: 'Xq', 10180: 'Xr', 10185: 'Xs', 10190: 'Xt', 10195: 'Xu',
    10200: 'Xv', 10205: 'Xw', 10210: 'Xx', 10215: 'Xy', 10220: 'Xz', 10225: 'X1', 10230: 'X2', 10235: 'X3', 10240: 'X4', 10245: 'X5',
    10250: 'X6', 10255: 'X7', 10260: 'X8', 10265: 'X9', 10270: 'X+', 10275: 'X/', 10280: 'X!', 10285: 'X@', 10290: 'X#', 10295: 'X$',
    10300: 'X%', 10305: 'X&', 10310: 'X(', 10315: 'X)', 10320: 'X=', 10325: 'X?', 10330: 'X*', 10335: 'X,', 10340: 'X.', 10345: 'X;',
    10350: 'X:', 10355: 'X-', 10360: 'X_', 10365: 'X<', 10370: 'X>', 10375: 'Y0', 10380: 'YA', 10385: 'YB', 10390: 'YC', 10395: 'YD',
    10400: 'YE', 10405: 'YF', 10410: 'YG', 10415: 'YH', 10420: 'YI', 10425: 'YJ', 10430: 'YK', 10435: 'YL', 10440: 'YM', 10445: 'YN',
    10450: 'YO', 10455: 'YP', 10460: 'YQ', 10465: 'YR', 10470: 'YS', 10475: 'YT', 10480: 'YU', 10485: 'YV', 10490: 'YW', 10495: 'YX',
    10500: 'YY', 10505: 'YZ', 10510: 'Ya', 10515: 'Yb', 10520: 'Yc', 10525: 'Yd', 10530: 'Ye', 10535: 'Yf', 10540: 'Yg', 10545: 'Yh',
    10550: 'Yi', 10555: 'Yj', 10560: 'Yk', 10565: 'Yl', 10570: 'Ym', 10575: 'Yn', 10580: 'Yo', 10585: 'Yp', 10590: 'Yq', 10595: 'Yr',
    10600: 'Ys', 10605: 'Yt', 10610: 'Yu', 10615: 'Yv', 10620: 'Yw', 10625: 'Yx', 10630: 'Yy', 10635: 'Yz', 10640: 'Y1', 10645: 'Y2',
    10650: 'Y3', 10655: 'Y4', 10660: 'Y5', 10665: 'Y6', 10670: 'Y7', 10675: 'Y8', 10680: 'Y9', 10685: 'Y+', 10690: 'Y/', 10695: 'Y!',
    10700: 'Y@', 10705: 'Y#', 10710: 'Y$', 10715: 'Y%', 10720: 'Y&', 10725: 'Y(', 10730: 'Y)', 10735: 'Y=', 10740: 'Y?', 10745: 'Y*',
    10750: 'Y,', 10755: 'Y.', 10760: 'Y;', 10765: 'Y:', 10770: 'Y-', 10775: 'Y_', 10780: 'Y<', 10785: 'Y>', 10790: 'Z0', 10795: 'ZA',
    10800: 'ZB', 10805: 'ZC', 10810: 'ZD', 10815: 'ZE', 10820: 'ZF', 10825: 'ZG', 10830: 'ZH', 10835: 'ZI', 10840: 'ZJ', 10845: 'ZK',
    10850: 'ZL', 10855: 'ZM', 10860: 'ZN', 10865: 'ZO', 10870: 'ZP', 10875: 'ZQ', 10880: 'ZR', 10885: 'ZS', 10890: 'ZT', 10895: 'ZU',
    10900: 'ZV', 10905: 'ZW', 10910: 'ZX', 10915: 'ZY', 10920: 'ZZ', 10925: 'Za', 10930: 'Zb', 10935: 'Zc', 10940: 'Zd', 10945: 'Ze',
    10950: 'Zf', 10955: 'Zg', 10960: 'Zh', 10965: 'Zi', 10970: 'Zj', 10975: 'Zk', 10980: 'Zl', 10985: 'Zm', 10990: 'Zn', 10995: 'Zo',
    11000: 'Zp', 11005: 'Zq', 11010: 'Zr', 11015: 'Zs', 11020: 'Zt', 11025: 'Zu', 11030: 'Zv', 11035: 'Zw', 11040: 'Zx', 11045: 'Zy',
    11050: 'Zz', 11055: 'Z1', 11060: 'Z2', 11065: 'Z3', 11070: 'Z4', 11075: 'Z5', 11080: 'Z6', 11085: 'Z7', 11090: 'Z8', 11095: 'Z9',
    11100: 'Z+', 11105: 'Z/', 11110: 'Z!', 11115: 'Z@', 11120: 'Z#', 11125: 'Z$', 11130: 'Z%', 11135: 'Z&', 11140: 'Z(', 11145: 'Z)',
    11150: 'Z=', 11155: 'Z?', 11160: 'Z*', 11165: 'Z,', 11170: 'Z.', 11175: 'Z;', 11180: 'Z:', 11185: 'Z-', 11190: 'Z_', 11195: 'Z<',
    11200: 'Z>', 11205: 'a0', 11210: 'aA', 11215: 'aB', 11220: 'aC', 11225: 'aD', 11230: 'aE', 11235: 'aF', 11240: 'aG', 11245: 'aH',
    11250: 'aI', 11255: 'aJ', 11260: 'aK', 11265: 'aL', 11270: 'aM', 11275: 'aN', 11280: 'aO', 11285: 'aP', 11290: 'aQ', 11295: 'aR',
    11300: 'aS', 11305: 'aT', 11310: 'aU', 11315: 'aV', 11320: 'aW', 11325: 'aX', 11330: 'aY', 11335: 'aZ', 11340: 'aa', 11345: 'ab',
    11350: 'ac', 11355: 'ad', 11360: 'ae', 11365: 'af', 11370: 'ag', 11375: 'ah', 11380: 'ai', 11385: 'aj', 11390: 'ak', 11395: 'al',
    11400: 'am', 11405: 'an', 11410: 'ao', 11415: 'ap', 11420: 'aq', 11425: 'ar', 11430: 'as', 11435: 'at', 11440: 'au', 11445: 'av',
    11450: 'aw', 11455: 'ax', 11460: 'ay', 11465: 'az', 11470: 'a1', 11475: 'a2', 11480: 'a3', 11485: 'a4', 11490: 'a5', 11495: 'a6',
    11500: 'a7', 11505: 'a8', 11510: 'a9', 11515: 'a+', 11520: 'a/', 11525: 'a!', 11530: 'a@', 11535: 'a#', 11540: 'a$', 11545: 'a%',
    11550: 'a&', 11555: 'a(', 11560: 'a)', 11565: 'a=', 11570: 'a?', 11575: 'a*', 11580: 'a,', 11585: 'a.', 11590: 'a;', 11595: 'a:',
    11600: 'a-', 11605: 'a_', 11610: 'a<', 11615: 'a>', 11620: 'b0', 11625: 'bA', 11630: 'bB', 11635: 'bC', 11640: 'bD', 11645: 'bE',
    11650: 'bF', 11655: 'bG', 11660: 'bH', 11665: 'bI', 11670: 'bJ', 11675: 'bK', 11680: 'bL', 11685: 'bM', 11690: 'bN', 11695: 'bO',
    11700: 'bP', 11705: 'bQ', 11710: 'bR', 11715: 'bS', 11720: 'bT', 11725: 'bU', 11730: 'bV', 11735: 'bW', 11740: 'bX', 11745: 'bY',
    11750: 'bZ', 11755: 'ba', 11760: 'bb', 11765: 'bc', 11770: 'bd', 11775: 'be', 11780: 'bf', 11785: 'bg', 11790: 'bh', 11795: 'bi',
    11800: 'bj', 11805: 'bk', 11810: 'bl', 11815: 'bm', 11820: 'bn', 11825: 'bo', 11830: 'bp', 11835: 'bq', 11840: 'br', 11845: 'bs',
    11850: 'bt', 11855: 'bu', 11860: 'bv', 11865: 'bw', 11870: 'bx', 11875: 'by', 11880: 'bz', 11885: 'b1', 11890: 'b2', 11895: 'b3',
    11900: 'b4', 11905: 'b5', 11910: 'b6', 11915: 'b7', 11920: 'b8', 11925: 'b9', 11930: 'b+', 11935: 'b/', 11940: 'b!', 11945: 'b@',
    11950: 'b#', 11955: 'b$', 11960: 'b%', 11965: 'b&', 11970: 'b(', 11975: 'b)', 11980: 'b=', 11985: 'b?', 11990: 'b*', 11995: 'b,',
    12000: 'b.', 12005: 'b;', 12010: 'b:', 12015: 'b-', 12020: 'b_', 12025: 'b<', 12030: 'b>', 12035: 'c0', 12040: 'cA', 12045: 'cB',
    12050: 'cC', 12055: 'cD', 12060: 'cE', 12065: 'cF', 12070: 'cG', 12075: 'cH', 12080: 'cI', 12085: 'cJ', 12090: 'cK', 12095: 'cL',
    12100: 'cM', 12105: 'cN', 12110: 'cO', 12115: 'cP', 12120: 'cQ', 12125: 'cR', 12130: 'cS', 12135: 'cT', 12140: 'cU', 12145: 'cV',
    12150: 'cW', 12155: 'cX', 12160: 'cY', 12165: 'cZ', 12170: 'ca', 12175: 'cb', 12180: 'cc', 12185: 'cd', 12190: 'ce', 12195: 'cf',
    12200: 'cg', 12205: 'ch', 12210: 'ci', 12215: 'cj', 12220: 'ck', 12225: 'cl', 12230: 'cm', 12235: 'cn', 12240: 'co', 12245: 'cp',
    12250: 'cq', 12255: 'cr', 12260: 'cs', 12265: 'ct', 12270: 'cu', 12275: 'cv', 12280: 'cw', 12285: 'cx', 12290: 'cy', 12295: 'cz',
    12300: 'c1', 12305: 'c2', 12310: 'c3', 12315: 'c4', 12320: 'c5', 12325: 'c6', 12330: 'c7', 12335: 'c8', 12340: 'c9', 12345: 'c+',
    12350: 'c/', 12355: 'c!', 12360: 'c@', 12365: 'c#', 12370: 'c$', 12375: 'c%', 12380: 'c&', 12385: 'c(', 12390: 'c)', 12395: 'c=',
    12400: 'c?', 12405: 'c*', 12410: 'c,', 12415: 'c.', 12420: 'c;', 12425: 'c:', 12430: 'c-', 12435: 'c_', 12440: 'c<', 12445: 'c>',
    12450: 'd0', 12455: 'dA', 12460: 'dB', 12465: 'dC', 12470: 'dD', 12475: 'dE', 12480: 'dF', 12485: 'dG', 12490: 'dH', 12495: 'dI',
    12500: 'dJ', 12505: 'dK', 12510: 'dL', 12515: 'dM', 12520: 'dN', 12525: 'dO', 12530: 'dP', 12535: 'dQ', 12540: 'dR', 12545: 'dS',
    12550: 'dT', 12555: 'dU', 12560: 'dV', 12565: 'dW', 12570: 'dX', 12575: 'dY', 12580: 'dZ', 12585: 'da', 12590: 'db', 12595: 'dc',
    12600: 'dd', 12605: 'de', 12610: 'df', 12615: 'dg', 12620: 'dh', 12625: 'di', 12630: 'dj', 12635: 'dk', 12640: 'dl', 12645: 'dm',
    12650: 'dn', 12655: 'do', 12660: 'dp', 12665: 'dq', 12670: 'dr', 12675: 'ds', 12680: 'dt', 12685: 'du', 12690: 'dv', 12695: 'dw',
    12700: 'dx', 12705: 'dy', 12710: 'dz', 12715: 'd1', 12720: 'd2', 12725: 'd3', 12730: 'd4', 12735: 'd5', 12740: 'd6', 12745: 'd7',
    12750: 'd8', 12755: 'd9', 12760: 'd+', 12765: 'd/', 12770: 'd!', 12775: 'd@', 12780: 'd#', 12785: 'd$', 12790: 'd%', 12795: 'd&',
    12800: 'd(', 12805: 'd)', 12810: 'd=', 12815: 'd?', 12820: 'd*', 12825: 'd,', 12830: 'd.', 12835: 'd;', 12840: 'd:', 12845: 'd-',
    12850: 'd_', 12855: 'd<', 12860: 'd>', 12865: 'e0', 12870: 'eA', 12875: 'eB', 12880: 'eC', 12885: 'eD', 12890: 'eE', 12895: 'eF',
    12900: 'eG', 12905: 'eH', 12910: 'eI', 12915: 'eJ', 12920: 'eK', 12925: 'eL', 12930: 'eM', 12935: 'eN', 12940: 'eO', 12945: 'eP',
    12950: 'eQ', 12955: 'eR', 12960: 'eS', 12965: 'eT', 12970: 'eU', 12975: 'eV', 12980: 'eW', 12985: 'eX', 12990: 'eY', 12995: 'eZ',
    13000: 'ea', 13005: 'eb', 13010: 'ec', 13015: 'ed', 13020: 'ee', 13025: 'ef', 13030: 'eg', 13035: 'eh', 13040: 'ei', 13045: 'ej',
    13050: 'ek', 13055: 'el', 13060: 'em', 13065: 'en', 13070: 'eo', 13075: 'ep', 13080: 'eq', 13085: 'er', 13090: 'es', 13095: 'et',
    13100: 'eu', 13105: 'ev', 13110: 'ew', 13115: 'ex', 13120: 'ey', 13125: 'ez', 13130: 'e1', 13135: 'e2', 13140: 'e3', 13145: 'e4',
    13150: 'e5', 13155: 'e6', 13160: 'e7', 13165: 'e8', 13170: 'e9', 13175: 'e+', 13180: 'e/', 13185: 'e!', 13190: 'e@', 13195: 'e#',
    13200: 'e$', 13205: 'e%', 13210: 'e&', 13215: 'e(', 13220: 'e)', 13225: 'e=', 13230: 'e?', 13235: 'e*', 13240: 'e,', 13245: 'e.',
    13250: 'e;', 13255: 'e:', 13260: 'e-', 13265: 'e_', 13270: 'e<', 13275: 'e>', 13280: 'f0', 13285: 'fA', 13290: 'fB', 13295: 'fC',
    13300: 'fD', 13305: 'fE', 13310: 'fF', 13315: 'fG', 13320: 'fH', 13325: 'fI', 13330: 'fJ', 13335: 'fK', 13340: 'fL', 13345: 'fM',
    13350: 'fN', 13355: 'fO', 13360: 'fP', 13365: 'fQ', 13370: 'fR', 13375: 'fS', 13380: 'fT', 13385: 'fU', 13390: 'fV', 13395: 'fW',
    13400: 'fX', 13405: 'fY', 13410: 'fZ', 13415: 'fa', 13420: 'fb', 13425: 'fc', 13430: 'fd', 13435: 'fe', 13440: 'ff', 13445: 'fg',
    13450: 'fh', 13455: 'fi', 13460: 'fj', 13465: 'fk', 13470: 'fl', 13475: 'fm', 13480: 'fn', 13485: 'fo', 13490: 'fp', 13495: 'fq',
    13500: 'fr', 13505: 'fs', 13510: 'ft', 13515: 'fu', 13520: 'fv', 13525: 'fw', 13530: 'fx', 13535: 'fy', 13540: 'fz', 13545: 'f1',
    13550: 'f2', 13555: 'f3', 13560: 'f4', 13565: 'f5', 13570: 'f6', 13575: 'f7', 13580: 'f8', 13585: 'f9', 13590: 'f+', 13595: 'f/',
    13600: 'f!', 13605: 'f@', 13610: 'f#', 13615: 'f$', 13620: 'f%', 13625: 'f&', 13630: 'f(', 13635: 'f)', 13640: 'f=', 13645: 'f?',
    13650: 'f*', 13655: 'f,', 13660: 'f.', 13665: 'f;', 13670: 'f:', 13675: 'f-', 13680: 'f_', 13685: 'f<', 13690: 'f>', 13695: 'g0',
    13700: 'gA', 13705: 'gB', 13710: 'gC', 13715: 'gD', 13720: 'gE', 13725: 'gF', 13730: 'gG', 13735: 'gH', 13740: 'gI', 13745: 'gJ',
    13750: 'gK', 13755: 'gL', 13760: 'gM', 13765: 'gN', 13770: 'gO', 13775: 'gP', 13780: 'gQ', 13785: 'gR', 13790: 'gS', 13795: 'gT',
    13800: 'gU', 13805: 'gV', 13810: 'gW', 13815: 'gX', 13820: 'gY', 13825: 'gZ', 13830: 'ga', 13835: 'gb', 13840: 'gc', 13845: 'gd',
    13850: 'ge', 13855: 'gf', 13860: 'gg', 13865: 'gh', 13870: 'gi', 13875: 'gj', 13880: 'gk', 13885: 'gl', 13890: 'gm', 13895: 'gn',
    13900: 'go', 13905: 'gp', 13910: 'gq', 13915: 'gr', 13920: 'gs', 13925: 'gt', 13930: 'gu', 13935: 'gv', 13940: 'gw', 13945: 'gx',
    13950: 'gy', 13955: 'gz', 13960: 'g1', 13965: 'g2', 13970: 'g3', 13975: 'g4', 13980: 'g5', 13985: 'g6', 13990: 'g7', 13995: 'g8',
    14000: 'g9', 14005: 'g+', 14010: 'g/', 14015: 'g!', 14020: 'g@', 14025: 'g#', 14030: 'g$', 14035: 'g%', 14040: 'g&', 14045: 'g(',
    14050: 'g)', 14055: 'g=', 14060: 'g?', 14065: 'g*', 14070: 'g,', 14075: 'g.', 14080: 'g;', 14085: 'g:', 14090: 'g-', 14095: 'g_',
    14100: 'g<', 14105: 'g>', 14110: 'h0', 14115: 'hA', 14120: 'hB', 14125: 'hC', 14130: 'hD', 14135: 'hE', 14140: 'hF', 14145: 'hG',
    14150: 'hH', 14155: 'hI', 14160: 'hJ', 14165: 'hK', 14170: 'hL', 14175: 'hM', 14180: 'hN', 14185: 'hO', 14190: 'hP', 14195: 'hQ',
    14200: 'hR', 14205: 'hS', 14210: 'hT', 14215: 'hU', 14220: 'hV', 14225: 'hW', 14230: 'hX', 14235: 'hY', 14240: 'hZ', 14245: 'ha',
    14250: 'hb', 14255: 'hc', 14260: 'hd', 14265: 'he', 14270: 'hf', 14275: 'hg', 14280: 'hh', 14285: 'hi', 14290: 'hj', 14295: 'hk',
    14300: 'hl', 14305: 'hm', 14310: 'hn', 14315: 'ho', 14320: 'hp', 14325: 'hq', 14330: 'hr', 14335: 'hs', 14340: 'ht', 14345: 'hu',
    14350: 'hv', 14355: 'hw', 14360: 'hx', 14365: 'hy', 14370: 'hz', 14375: 'h1', 14380: 'h2', 14385: 'h3', 14390: 'h4', 14395: 'h5',
    14400: 'h6', 14405: 'h7', 14410: 'h8', 14415: 'h9', 14420: 'h+', 14425: 'h/', 14430: 'h!', 14435: 'h@', 14440: 'h#', 14445: 'h$',
    14450: 'h%', 14455: 'h&', 14460: 'h(', 14465: 'h)', 14470: 'h=', 14475: 'h?', 14480: 'h*', 14485: 'h,', 14490: 'h.', 14495: 'h;',
    14500: 'h:', 14505: 'h-', 14510: 'h_', 14515: 'h<', 14520: 'h>', 14525: 'i0', 14530: 'iA', 14535: 'iB', 14540: 'iC', 14545: 'iD',
    14550: 'iE', 14555: 'iF', 14560: 'iG', 14565: 'iH', 14570: 'iI', 14575: 'iJ', 14580: 'iK', 14585: 'iL', 14590: 'iM', 14595: 'iN',
    14600: 'iO', 14605: 'iP', 14610: 'iQ', 14615: 'iR', 14620: 'iS', 14625: 'iT', 14630: 'iU', 14635: 'iV', 14640: 'iW', 14645: 'iX',
    14650: 'iY', 14655: 'iZ', 14660: 'ia', 14665: 'ib', 14670: 'ic', 14675: 'id', 14680: 'ie', 14685: 'if', 14690: 'ig', 14695: 'ih',
    14700: 'ii', 14705: 'ij', 14710: 'ik', 14715: 'il', 14720: 'im', 14725: 'in', 14730: 'io', 14735: 'ip', 14740: 'iq', 14745: 'ir',
    14750: 'is', 14755: 'it', 14760: 'iu', 14765: 'iv', 14770: 'iw', 14775: 'ix', 14780: 'iy', 14785: 'iz', 14790: 'i1', 14795: 'i2',
    14800: 'i3', 14805: 'i4', 14810: 'i5', 14815: 'i6', 14820: 'i7', 14825: 'i8', 14830: 'i9', 14835: 'i+', 14840: 'i/', 14845: 'i!',
    14850: 'i@', 14855: 'i#', 14860: 'i$', 14865: 'i%', 14870: 'i&', 14875: 'i(', 14880: 'i)', 14885: 'i=', 14890: 'i?', 14895: 'i*',
    14900: 'i,', 14905: 'i.', 14910: 'i;', 14915: 'i:', 14920: 'i-', 14925: 'i_', 14930: 'i<', 14935: 'i>', 14940: 'j0', 14945: 'jA',
    14950: 'jB', 14955: 'jC', 14960: 'jD', 14965: 'jE', 14970: 'jF', 14975: 'jG', 14980: 'jH', 14985: 'jI', 14990: 'jJ', 14995: 'jK',
    15000: 'jL', 15005: 'jM', 15010: 'jN', 15015: 'jO', 15020: 'jP', 15025: 'jQ', 15030: 'jR', 15035: 'jS', 15040: 'jT', 15045: 'jU',
    15050: 'jV', 15055: 'jW', 15060: 'jX', 15065: 'jY', 15070: 'jZ', 15075: 'ja', 15080: 'jb', 15085: 'jc', 15090: 'jd', 15095: 'je',
    15100: 'jf', 15105: 'jg', 15110: 'jh', 15115: 'ji', 15120: 'jj', 15125: 'jk', 15130: 'jl', 15135: 'jm', 15140: 'jn', 15145: 'jo',
    15150: 'jp', 15155: 'jq', 15160: 'jr', 15165: 'js', 15170: 'jt', 15175: 'ju', 15180: 'jv', 15185: 'jw', 15190: 'jx', 15195: 'jy',
    15200: 'jz', 15205: 'j1', 15210: 'j2', 15215: 'j3', 15220: 'j4', 15225: 'j5', 15230: 'j6', 15235: 'j7', 15240: 'j8', 15245: 'j9',
    15250: 'j+', 15255: 'j/', 15260: 'j!', 15265: 'j@', 15270: 'j#', 15275: 'j$', 15280: 'j%', 15285: 'j&', 15290: 'j(', 15295: 'j)',
    15300: 'j=', 15305: 'j?', 15310: 'j*', 15315: 'j,', 15320: 'j.', 15325: 'j;', 15330: 'j:', 15335: 'j-', 15340: 'j_', 15345: 'j<',
    15350: 'j>', 15355: 'k0', 15360: 'kA', 15365: 'kB', 15370: 'kC', 15375: 'kD', 15380: 'kE', 15385: 'kF', 15390: 'kG', 15395: 'kH',
    15400: 'kI', 15405: 'kJ', 15410: 'kK', 15415: 'kL', 15420: 'kM', 15425: 'kN', 15430: 'kO', 15435: 'kP', 15440: 'kQ', 15445: 'kR',
    15450: 'kS', 15455: 'kT', 15460: 'kU', 15465: 'kV', 15470: 'kW', 15475: 'kX', 15480: 'kY', 15485: 'kZ', 15490: 'ka', 15495: 'kb',
    15500: 'kc', 15505: 'kd', 15510: 'ke', 15515: 'kf', 15520: 'kg', 15525: 'kh', 15530: 'ki', 15535: 'kj', 15540: 'kk', 15545: 'kl',
    15550: 'km', 15555: 'kn', 15560: 'ko', 15565: 'kp', 15570: 'kq', 15575: 'kr', 15580: 'ks', 15585: 'kt', 15590: 'ku', 15595: 'kv',
    15600: 'kw', 15605: 'kx', 15610: 'ky', 15615: 'kz', 15620: 'k1', 15625: 'k2', 15630: 'k3', 15635: 'k4', 15640: 'k5', 15645: 'k6',
    15650: 'k7', 15655: 'k8', 15660: 'k9', 15665: 'k+', 15670: 'k/', 15675: 'k!', 15680: 'k@', 15685: 'k#', 15690: 'k$', 15695: 'k%',
    15700: 'k&', 15705: 'k(', 15710: 'k)', 15715: 'k=', 15720: 'k?', 15725: 'k*', 15730: 'k,', 15735: 'k.', 15740: 'k;', 15745: 'k:',
    15750: 'k-', 15755: 'k_', 15760: 'k<', 15765: 'k>', 15770: 'l0', 15775: 'lA', 15780: 'lB', 15785: 'lC', 15790: 'lD', 15795: 'lE',
    15800: 'lF', 15805: 'lG', 15810: 'lH', 15815: 'lI', 15820: 'lJ', 15825: 'lK', 15830: 'lL', 15835: 'lM', 15840: 'lN', 15845: 'lO',
    15850: 'lP', 15855: 'lQ', 15860: 'lR', 15865: 'lS', 15870: 'lT', 15875: 'lU', 15880: 'lV', 15885: 'lW', 15890: 'lX', 15895: 'lY',
    15900: 'lZ', 15905: 'la', 15910: 'lb', 15915: 'lc', 15920: 'ld', 15925: 'le', 15930: 'lf', 15935: 'lg', 15940: 'lh', 15945: 'li',
    15950: 'lj', 15955: 'lk', 15960: 'll', 15965: 'lm', 15970: 'ln', 15975: 'lo', 15980: 'lp', 15985: 'lq', 15990: 'lr', 15995: 'ls',
    16000: 'lt', 16005: 'lu', 16010: 'lv', 16015: 'lw', 16020: 'lx', 16025: 'ly', 16030: 'lz', 16035: 'l1', 16040: 'l2', 16045: 'l3',
    16050: 'l4', 16055: 'l5', 16060: 'l6', 16065: 'l7', 16070: 'l8', 16075: 'l9', 16080: 'l+', 16085: 'l/', 16090: 'l!', 16095: 'l@',
    16100: 'l#', 16105: 'l$', 16110: 'l%', 16115: 'l&', 16120: 'l(', 16125: 'l)', 16130: 'l=', 16135: 'l?', 16140: 'l*', 16145: 'l,',
    16150: 'l.', 16155: 'l;', 16160: 'l:', 16165: 'l-', 16170: 'l_', 16175: 'l<', 16180: 'l>', 16185: 'm0', 16190: 'mA', 16195: 'mB',
    16200: 'mC', 16205: 'mD', 16210: 'mE', 16215: 'mF', 16220: 'mG', 16225: 'mH', 16230: 'mI', 16235: 'mJ', 16240: 'mK', 16245: 'mL',
    16250: 'mM', 16255: 'mN', 16260: 'mO', 16265: 'mP', 16270: 'mQ', 16275: 'mR', 16280: 'mS', 16285: 'mT', 16290: 'mU', 16295: 'mV',
    16300: 'mW', 16305: 'mX', 16310: 'mY', 16315: 'mZ', 16320: 'ma', 16325: 'mb', 16330: 'mc', 16335: 'md', 16340: 'me', 16345: 'mf',
    16350: 'mg', 16355: 'mh', 16360: 'mi', 16365: 'mj', 16370: 'mk', 16375: 'ml', 16380: 'mm', 16385: 'mn', 16390: 'mo', 16395: 'mp',
    16400: 'mq', 16405: 'mr', 16410: 'ms', 16415: 'mt', 16420: 'mu', 16425: 'mv', 16430: 'mw', 16435: 'mx', 16440: 'my', 16445: 'mz',
    16450: 'm1', 16455: 'm2', 16460: 'm3', 16465: 'm4', 16470: 'm5', 16475: 'm6', 16480: 'm7', 16485: 'm8', 16490: 'm9', 16495: 'm+',
    16500: 'm/', 16505: 'm!', 16510: 'm@', 16515: 'm#', 16520: 'm$', 16525: 'm%', 16530: 'm&', 16535: 'm(', 16540: 'm)', 16545: 'm=',
    16550: 'm?', 16555: 'm*', 16560: 'm,', 16565: 'm.', 16570: 'm;', 16575: 'm:', 16580: 'm-', 16585: 'm_', 16590: 'm<', 16595: 'm>',
    16600: 'n0', 16605: 'nA', 16610: 'nB', 16615: 'nC', 16620: 'nD', 16625: 'nE', 16630: 'nF', 16635: 'nG', 16640: 'nH', 16645: 'nI',
    16650: 'nJ', 16655: 'nK', 16660: 'nL', 16665: 'nM', 16670: 'nN', 16675: 'nO', 16680: 'nP', 16685: 'nQ', 16690: 'nR', 16695: 'nS',
    16700: 'nT', 16705: 'nU', 16710: 'nV', 16715: 'nW', 16720: 'nX', 16725: 'nY', 16730: 'nZ', 16735: 'na', 16740: 'nb', 16745: 'nc',
    16750: 'nd', 16755: 'ne', 16760: 'nf', 16765: 'ng', 16770: 'nh', 16775: 'ni', 16780: 'nj', 16785: 'nk', 16790: 'nl', 16795: 'nm',
    16800: 'nn', 16805: 'no', 16810: 'np', 16815: 'nq', 16820: 'nr', 16825: 'ns', 16830: 'nt', 16835: 'nu', 16840: 'nv', 16845: 'nw',
    16850: 'nx', 16855: 'ny', 16860: 'nz', 16865: 'n1', 16870: 'n2', 16875: 'n3', 16880: 'n4', 16885: 'n5', 16890: 'n6', 16895: 'n7',
    16900: 'n8', 16905: 'n9', 16910: 'n+', 16915: 'n/', 16920: 'n!', 16925: 'n@', 16930: 'n#', 16935: 'n$', 16940: 'n%', 16945: 'n&',
    16950: 'n(', 16955: 'n)', 16960: 'n=', 16965: 'n?', 16970: 'n*', 16975: 'n,', 16980: 'n.', 16985: 'n;', 16990: 'n:', 16995: 'n-',
    17000: 'n_', 17005: 'n<', 17010: 'n>', 17015: 'o0', 17020: 'oA', 17025: 'oB', 17030: 'oC', 17035: 'oD', 17040: 'oE', 17045: 'oF',
    17050: 'oG', 17055: 'oH', 17060: 'oI', 17065: 'oJ', 17070: 'oK', 17075: 'oL', 17080: 'oM', 17085: 'oN', 17090: 'oO', 17095: 'oP',
    17100: 'oQ', 17105: 'oR', 17110: 'oS', 17115: 'oT', 17120: 'oU', 17125: 'oV', 17130: 'oW', 17135: 'oX', 17140: 'oY', 17145: 'oZ',
    17150: 'oa', 17155: 'ob', 17160: 'oc', 17165: 'od', 17170: 'oe', 17175: 'of', 17180: 'og', 17185: 'oh', 17190: 'oi', 17195: 'oj',
    17200: 'ok', 17205: 'ol', 17210: 'om', 17215: 'on', 17220: 'oo', 17225: 'op', 17230: 'oq', 17235: 'or', 17240: 'os', 17245: 'ot',
    17250: 'ou', 17255: 'ov', 17260: 'ow', 17265: 'ox', 17270: 'oy', 17275: 'oz', 17280: 'o1', 17285: 'o2', 17290: 'o3', 17295: 'o4',
    17300: 'o5', 17305: 'o6', 17310: 'o7', 17315: 'o8', 17320: 'o9', 17325: 'o+', 17330: 'o/', 17335: 'o!', 17340: 'o@', 17345: 'o#',
    17350: 'o$', 17355: 'o%', 17360: 'o&', 17365: 'o(', 17370: 'o)', 17375: 'o=', 17380: 'o?', 17385: 'o*', 17390: 'o,', 17395: 'o.',
    17400: 'o;', 17405: 'o:', 17410: 'o-', 17415: 'o_', 17420: 'o<', 17425: 'o>', 17430: 'p0', 17435: 'pA', 17440: 'pB', 17445: 'pC',
    17450: 'pD', 17455: 'pE', 17460: 'pF', 17465: 'pG', 17470: 'pH', 17475: 'pI', 17480: 'pJ', 17485: 'pK', 17490: 'pL', 17495: 'pM',
    17500: 'pN', 17505: 'pO', 17510: 'pP', 17515: 'pQ', 17520: 'pR', 17525: 'pS', 17530: 'pT', 17535: 'pU', 17540: 'pV', 17545: 'pW',
    17550: 'pX', 17555: 'pY', 17560: 'pZ', 17565: 'pa', 17570: 'pb', 17575: 'pc', 17580: 'pd', 17585: 'pe', 17590: 'pf', 17595: 'pg',
    17600: 'ph', 17605: 'pi', 17610: 'pj', 17615: 'pk', 17620: 'pl', 17625: 'pm', 17630: 'pn', 17635: 'po', 17640: 'pp', 17645: 'pq',
    17650: 'pr', 17655: 'ps', 17660: 'pt', 17665: 'pu', 17670: 'pv', 17675: 'pw', 17680: 'px', 17685: 'py', 17690: 'pz', 17695: 'p1',
    17700: 'p2', 17705: 'p3', 17710: 'p4', 17715: 'p5', 17720: 'p6', 17725: 'p7', 17730: 'p8', 17735: 'p9', 17740: 'p+', 17745: 'p/',
    17750: 'p!', 17755: 'p@', 17760: 'p#', 17765: 'p$', 17770: 'p%', 17775: 'p&', 17780: 'p(', 17785: 'p)', 17790: 'p=', 17795: 'p?',
    17800: 'p*', 17805: 'p,', 17810: 'p.', 17815: 'p;', 17820: 'p:', 17825: 'p-', 17830: 'p_', 17835: 'p<', 17840: 'p>', 17845: 'q0',
    17850: 'qA', 17855: 'qB', 17860: 'qC', 17865: 'qD', 17870: 'qE', 17875: 'qF', 17880: 'qG', 17885: 'qH', 17890: 'qI', 17895: 'qJ',
    17900: 'qK', 17905: 'qL', 17910: 'qM', 17915: 'qN', 17920: 'qO', 17925: 'qP', 17930: 'qQ', 17935: 'qR', 17940: 'qS', 17945: 'qT',
    17950: 'qU', 17955: 'qV', 17960: 'qW', 17965: 'qX', 17970: 'qY', 17975: 'qZ', 17980: 'qa', 17985: 'qb', 17990: 'qc', 17995: 'qd',
    18000: 'qe', 18005: 'qf', 18010: 'qg', 18015: 'qh', 18020: 'qi', 18025: 'qj', 18030: 'qk', 18035: 'ql', 18040: 'qm', 18045: 'qn',
    18050: 'qo', 18055: 'qp', 18060: 'qq', 18065: 'qr', 18070: 'qs', 18075: 'qt', 18080: 'qu', 18085: 'qv', 18090: 'qw', 18095: 'qx',
    18100: 'qy', 18105: 'qz', 18110: 'q1', 18115: 'q2', 18120: 'q3', 18125: 'q4', 18130: 'q5', 18135: 'q6', 18140: 'q7', 18145: 'q8',
    18150: 'q9', 18155: 'q+', 18160: 'q/', 18165: 'q!', 18170: 'q@', 18175: 'q#', 18180: 'q$', 18185: 'q%', 18190: 'q&', 18195: 'q(',
    18200: 'q)', 18205: 'q=', 18210: 'q?', 18215: 'q*', 18220: 'q,', 18225: 'q.', 18230: 'q;', 18235: 'q:', 18240: 'q-', 18245: 'q_',
    18250: 'q<', 18255: 'q>', 18260: 'r0', 18265: 'rA', 18270: 'rB', 18275: 'rC', 18280: 'rD', 18285: 'rE', 18290: 'rF', 18295: 'rG',
    18300: 'rH', 18305: 'rI', 18310: 'rJ', 18315: 'rK', 18320: 'rL', 18325: 'rM', 18330: 'rN', 18335: 'rO', 18340: 'rP', 18345: 'rQ',
    18350: 'rR', 18355: 'rS', 18360: 'rT', 18365: 'rU', 18370: 'rV', 18375: 'rW', 18380: 'rX', 18385: 'rY', 18390: 'rZ', 18395: 'ra',
    18400: 'rb', 18405: 'rc', 18410: 'rd', 18415: 're', 18420: 'rf', 18425: 'rg', 18430: 'rh', 18435: 'ri', 18440: 'rj', 18445: 'rk',
    18450: 'rl', 18455: 'rm', 18460: 'rn', 18465: 'ro', 18470: 'rp', 18475: 'rq', 18480: 'rr', 18485: 'rs', 18490: 'rt', 18495: 'ru',
    18500: 'rv', 18505: 'rw', 18510: 'rx', 18515: 'ry', 18520: 'rz', 18525: 'r1', 18530: 'r2', 18535: 'r3', 18540: 'r4', 18545: 'r5',
    18550: 'r6', 18555: 'r7', 18560: 'r8', 18565: 'r9', 18570: 'r+', 18575: 'r/', 18580: 'r!', 18585: 'r@', 18590: 'r#', 18595: 'r$',
    18600: 'r%', 18605: 'r&', 18610: 'r(', 18615: 'r)', 18620: 'r=', 18625: 'r?', 18630: 'r*', 18635: 'r,', 18640: 'r.', 18645: 'r;',
    18650: 'r:', 18655: 'r-', 18660: 'r_', 18665: 'r<', 18670: 'r>', 18675: 's0', 18680: 'sA', 18685: 'sB', 18690: 'sC', 18695: 'sD',
    18700: 'sE', 18705: 'sF', 18710: 'sG', 18715: 'sH', 18720: 'sI', 18725: 'sJ', 18730: 'sK', 18735: 'sL', 18740: 'sM', 18745: 'sN',
    18750: 'sO', 18755: 'sP', 18760: 'sQ', 18765: 'sR', 18770: 'sS', 18775: 'sT', 18780: 'sU', 18785: 'sV', 18790: 'sW', 18795: 'sX',
    18800: 'sY', 18805: 'sZ', 18810: 'sa', 18815: 'sb', 18820: 'sc', 18825: 'sd', 18830: 'se', 18835: 'sf', 18840: 'sg', 18845: 'sh',
    18850: 'si', 18855: 'sj', 18860: 'sk', 18865: 'sl', 18870: 'sm', 18875: 'sn', 18880: 'so', 18885: 'sp', 18890: 'sq', 18895: 'sr',
    18900: 'ss', 18905: 'st', 18910: 'su', 18915: 'sv', 18920: 'sw', 18925: 'sx', 18930: 'sy', 18935: 'sz', 18940: 's1', 18945: 's2',
    18950: 's3', 18955: 's4', 18960: 's5', 18965: 's6', 18970: 's7', 18975: 's8', 18980: 's9', 18985: 's+', 18990: 's/', 18995: 's!',
    19000: 's@', 19005: 's#', 19010: 's$', 19015: 's%', 19020: 's&', 19025: 's(', 19030: 's)', 19035: 's=', 19040: 's?', 19045: 's*',
    19050: 's,', 19055: 's.', 19060: 's;', 19065: 's:', 19070: 's-', 19075: 's_', 19080: 's<', 19085: 's>', 19090: 't0', 19095: 'tA',
    19100: 'tB', 19105: 'tC', 19110: 'tD', 19115: 'tE', 19120: 'tF', 19125: 'tG', 19130: 'tH', 19135: 'tI', 19140: 'tJ', 19145: 'tK',
    19150: 'tL', 19155: 'tM', 19160: 'tN', 19165: 'tO', 19170: 'tP', 19175: 'tQ', 19180: 'tR', 19185: 'tS', 19190: 'tT', 19195: 'tU',
    19200: 'tV', 19205: 'tW', 19210: 'tX', 19215: 'tY', 19220: 'tZ', 19225: 'ta', 19230: 'tb', 19235: 'tc', 19240: 'td', 19245: 'te',
    19250: 'tf', 19255: 'tg', 19260: 'th', 19265: 'ti', 19270: 'tj', 19275: 'tk', 19280: 'tl', 19285: 'tm', 19290: 'tn', 19295: 'to',
    19300: 'tp', 19305: 'tq', 19310: 'tr', 19315: 'ts', 19320: 'tt', 19325: 'tu', 19330: 'tv', 19335: 'tw', 19340: 'tx', 19345: 'ty',
    19350: 'tz', 19355: 't1', 19360: 't2', 19365: 't3', 19370: 't4', 19375: 't5', 19380: 't6', 19385: 't7', 19390: 't8', 19395: 't9',
    19400: 't+', 19405: 't/', 19410: 't!', 19415: 't@', 19420: 't#', 19425: 't$', 19430: 't%', 19435: 't&', 19440: 't(', 19445: 't)',
    19450: 't=', 19455: 't?', 19460: 't*', 19465: 't,', 19470: 't.', 19475: 't;', 19480: 't:', 19485: 't-', 19490: 't_', 19495: 't<',
    19500: 't>', 19505: 'u0', 19510: 'uA', 19515: 'uB', 19520: 'uC', 19525: 'uD', 19530: 'uE', 19535: 'uF', 19540: 'uG', 19545: 'uH',
    19550: 'uI', 19555: 'uJ', 19560: 'uK', 19565: 'uL', 19570: 'uM', 19575: 'uN', 19580: 'uO', 19585: 'uP', 19590: 'uQ', 19595: 'uR',
    19600: 'uS', 19605: 'uT', 19610: 'uU', 19615: 'uV', 19620: 'uW', 19625: 'uX', 19630: 'uY', 19635: 'uZ', 19640: 'ua', 19645: 'ub',
    19650: 'uc', 19655: 'ud', 19660: 'ue', 19665: 'uf', 19670: 'ug', 19675: 'uh', 19680: 'ui', 19685: 'uj', 19690: 'uk', 19695: 'ul',
    19700: 'um', 19705: 'un', 19710: 'uo', 19715: 'up', 19720: 'uq', 19725: 'ur', 19730: 'us', 19735: 'ut', 19740: 'uu', 19745: 'uv',
    19750: 'uw', 19755: 'ux', 19760: 'uy', 19765: 'uz', 19770: 'u1', 19775: 'u2', 19780: 'u3', 19785: 'u4', 19790: 'u5', 19795: 'u6',
    19800: 'u7', 19805: 'u8', 19810: 'u9', 19815: 'u+', 19820: 'u/', 19825: 'u!', 19830: 'u@', 19835: 'u#', 19840: 'u$', 19845: 'u%',
    19850: 'u&', 19855: 'u(', 19860: 'u)', 19865: 'u=', 19870: 'u?', 19875: 'u*', 19880: 'u,', 19885: 'u.', 19890: 'u;', 19895: 'u:',
    19900: 'u-', 19905: 'u_', 19910: 'u<', 19915: 'u>', 19920: 'v0', 19925: 'vA', 19930: 'vB', 19935: 'vC', 19940: 'vD', 19945: 'vE',
    19950: 'vF', 19955: 'vG', 19960: 'vH', 19965: 'vI', 19970: 'vJ', 19975: 'vK', 19980: 'vL', 19985: 'vM', 19990: 'vN', 19995: 'vO',
    20000: 'vP', 20005: 'vQ', 20010: 'vR', 20015: 'vS', 20020: 'vT', 20025: 'vU', 20030: 'vV', 20035: 'vW', 20040: 'vX', 20045: 'vY',
    20050: 'vZ', 20055: 'va', 20060: 'vb', 20065: 'vc', 20070: 'vd', 20075: 've', 20080: 'vf', 20085: 'vg', 20090: 'vh', 20095: 'vi',
    20100: 'vj', 20105: 'vk', 20110: 'vl', 20115: 'vm', 20120: 'vn', 20125: 'vo', 20130: 'vp', 20135: 'vq', 20140: 'vr', 20145: 'vs',
    20150: 'vt', 20155: 'vu', 20160: 'vv', 20165: 'vw', 20170: 'vx', 20175: 'vy', 20180: 'vz', 20185: 'v1', 20190: 'v2', 20195: 'v3',
    20200: 'v4', 20205: 'v5', 20210: 'v6', 20215: 'v7', 20220: 'v8', 20225: 'v9', 20230: 'v+', 20235: 'v/', 20240: 'v!', 20245: 'v@',
    20250: 'v#', 20255: 'v$', 20260: 'v%', 20265: 'v&', 20270: 'v(', 20275: 'v)', 20280: 'v=', 20285: 'v?', 20290: 'v*', 20295: 'v,',
    20300: 'v.', 20305: 'v;', 20310: 'v:', 20315: 'v-', 20320: 'v_', 20325: 'v<', 20330: 'v>', 20335: 'w0', 20340: 'wA', 20345: 'wB',
    20350: 'wC', 20355: 'wD', 20360: 'wE', 20365: 'wF', 20370: 'wG', 20375: 'wH', 20380: 'wI', 20385: 'wJ', 20390: 'wK', 20395: 'wL',
    20400: 'wM', 20405: 'wN', 20410: 'wO', 20415: 'wP', 20420: 'wQ', 20425: 'wR', 20430: 'wS', 20435: 'wT', 20440: 'wU', 20445: 'wV',
    20450: 'wW', 20455: 'wX', 20460: 'wY', 20465: 'wZ', 20470: 'wa', 20475: 'wb', 20480: 'wc', 20485: 'wd', 20490: 'we', 20495: 'wf',
    20500: 'wg', 20505: 'wh', 20510: 'wi', 20515: 'wj', 20520: 'wk', 20525: 'wl', 20530: 'wm', 20535: 'wn', 20540: 'wo', 20545: 'wp',
    20550: 'wq', 20555: 'wr', 20560: 'ws', 20565: 'wt', 20570: 'wu', 20575: 'wv', 20580: 'ww', 20585: 'wx', 20590: 'wy', 20595: 'wz',
    20600: 'w1', 20605: 'w2', 20610: 'w3', 20615: 'w4', 20620: 'w5', 20625: 'w6', 20630: 'w7', 20635: 'w8', 20640: 'w9', 20645: 'w+',
    20650: 'w/', 20655: 'w!', 20660: 'w@', 20665: 'w#', 20670: 'w$', 20675: 'w%', 20680: 'w&', 20685: 'w(', 20690: 'w)', 20695: 'w=',
    20700: 'w?', 20705: 'w*', 20710: 'w,', 20715: 'w.', 20720: 'w;', 20725: 'w:', 20730: 'w-', 20735: 'w_', 20740: 'w<', 20745: 'w>',
    20750: 'x0', 20755: 'xA', 20760: 'xB', 20765: 'xC', 20770: 'xD', 20775: 'xE', 20780: 'xF', 20785: 'xG', 20790: 'xH', 20795: 'xI',
    20800: 'xJ', 20805: 'xK', 20810: 'xL', 20815: 'xM', 20820: 'xN', 20825: 'xO', 20830: 'xP', 20835: 'xQ', 20840: 'xR', 20845: 'xS',
    20850: 'xT', 20855: 'xU', 20860: 'xV', 20865: 'xW', 20870: 'xX', 20875: 'xY', 20880: 'xZ', 20885: 'xa', 20890: 'xb', 20895: 'xc',
    20900: 'xd', 20905: 'xe', 20910: 'xf', 20915: 'xg', 20920: 'xh', 20925: 'xi', 20930: 'xj', 20935: 'xk', 20940: 'xl', 20945: 'xm',
    20950: 'xn', 20955: 'xo', 20960: 'xp', 20965: 'xq', 20970: 'xr', 20975: 'xs', 20980: 'xt', 20985: 'xu', 20990: 'xv', 20995: 'xw',
    21000: 'xx', 21005: 'xy', 21010: 'xz', 21015: 'x1', 21020: 'x2', 21025: 'x3', 21030: 'x4', 21035: 'x5', 21040: 'x6', 21045: 'x7',
    21050: 'x8', 21055: 'x9', 21060: 'x+', 21065: 'x/', 21070: 'x!', 21075: 'x@', 21080: 'x#', 21085: 'x$', 21090: 'x%', 21095: 'x&',
    21100: 'x(', 21105: 'x)', 21110: 'x=', 21115: 'x?', 21120: 'x*', 21125: 'x,', 21130: 'x.', 21135: 'x;', 21140: 'x:', 21145: 'x-',
    21150: 'x_', 21155: 'x<', 21160: 'x>', 21165: 'y0', 21170: 'yA', 21175: 'yB', 21180: 'yC', 21185: 'yD', 21190: 'yE', 21195: 'yF',
    21200: 'yG', 21205: 'yH', 21210: 'yI', 21215: 'yJ', 21220: 'yK', 21225: 'yL', 21230: 'yM', 21235: 'yN', 21240: 'yO', 21245: 'yP',
    21250: 'yQ', 21255: 'yR', 21260: 'yS', 21265: 'yT', 21270: 'yU', 21275: 'yV', 21280: 'yW', 21285: 'yX', 21290: 'yY', 21295: 'yZ',
    21300: 'ya', 21305: 'yb', 21310: 'yc', 21315: 'yd', 21320: 'ye', 21325: 'yf', 21330: 'yg', 21335: 'yh', 21340: 'yi', 21345: 'yj',
    21350: 'yk', 21355: 'yl', 21360: 'ym', 21365: 'yn', 21370: 'yo', 21375: 'yp', 21380: 'yq', 21385: 'yr', 21390: 'ys', 21395: 'yt',
    21400: 'yu', 21405: 'yv', 21410: 'yw', 21415: 'yx', 21420: 'yy', 21425: 'yz', 21430: 'y1', 21435: 'y2', 21440: 'y3', 21445: 'y4',
    21450: 'y5', 21455: 'y6', 21460: 'y7', 21465: 'y8', 21470: 'y9', 21475: 'y+', 21480: 'y/', 21485: 'y!', 21490: 'y@', 21495: 'y#',
    21500: 'y$', 21505: 'y%', 21510: 'y&', 21515: 'y(', 21520: 'y)', 21525: 'y=', 21530: 'y?', 21535: 'y*', 21540: 'y,', 21545: 'y.',
    21550: 'y;', 21555: 'y:', 21560: 'y-', 21565: 'y_', 21570: 'y<', 21575: 'y>', 21580: 'z0', 21585: 'zA', 21590: 'zB', 21595: 'zC',
    21600: 'zD', 21605: 'zE', 21610: 'zF', 21615: 'zG', 21620: 'zH', 21625: 'zI', 21630: 'zJ', 21635: 'zK', 21640: 'zL', 21645: 'zM',
    21650: 'zN', 21655: 'zO', 21660: 'zP', 21665: 'zQ', 21670: 'zR', 21675: 'zS', 21680: 'zT', 21685: 'zU', 21690: 'zV', 21695: 'zW',
    21700: 'zX', 21705: 'zY', 21710: 'zZ', 21715: 'za', 21720: 'zb', 21725: 'zc', 21730: 'zd', 21735: 'ze', 21740: 'zf', 21745: 'zg',
    21750: 'zh', 21755: 'zi', 21760: 'zj', 21765: 'zk', 21770: 'zl', 21775: 'zm', 21780: 'zn', 21785: 'zo', 21790: 'zp', 21795: 'zq',
    21800: 'zr', 21805: 'zs', 21810: 'zt', 21815: 'zu', 21820: 'zv', 21825: 'zw', 21830: 'zx', 21835: 'zy', 21840: 'zz', 21845: 'z1',
    21850: 'z2', 21855: 'z3', 21860: 'z4', 21865: 'z5', 21870: 'z6', 21875: 'z7', 21880: 'z8', 21885: 'z9', 21890: 'z+', 21895: 'z/',
    21900: 'z!', 21905: 'z@', 21910: 'z#', 21915: 'z$', 21920: 'z%', 21925: 'z&', 21930: 'z(', 21935: 'z)', 21940: 'z=', 21945: 'z?',
    21950: 'z*', 21955: 'z,', 21960: 'z.', 21965: 'z;', 21970: 'z:', 21975: 'z-', 21980: 'z_', 21985: 'z<', 21990: 'z>', 21995: '10',
    22000: '1A', 22005: '1B', 22010: '1C', 22015: '1D', 22020: '1E', 22025: '1F', 22030: '1G', 22035: '1H', 22040: '1I', 22045: '1J',
    22050: '1K', 22055: '1L', 22060: '1M', 22065: '1N', 22070: '1O', 22075: '1P', 22080: '1Q', 22085: '1R', 22090: '1S', 22095: '1T',
    22100: '1U', 22105: '1V', 22110: '1W', 22115: '1X', 22120: '1Y', 22125: '1Z', 22130: '1a', 22135: '1b', 22140: '1c', 22145: '1d',
    22150: '1e', 22155: '1f', 22160: '1g', 22165: '1h', 22170: '1i', 22175: '1j', 22180: '1k', 22185: '1l', 22190: '1m', 22195: '1n',
    22200: '1o', 22205: '1p', 22210: '1q', 22215: '1r', 22220: '1s', 22225: '1t', 22230: '1u', 22235: '1v', 22240: '1w', 22245: '1x',
    22250: '1y', 22255: '1z', 22260: '11', 22265: '12', 22270: '13', 22275: '14', 22280: '15', 22285: '16', 22290: '17', 22295: '18',
    22300: '19', 22305: '1+', 22310: '1/', 22315: '1!', 22320: '1@', 22325: '1#', 22330: '1$', 22335: '1%', 22340: '1&', 22345: '1(',
    22350: '1)', 22355: '1=', 22360: '1?', 22365: '1*', 22370: '1,', 22375: '1.', 22380: '1;', 22385: '1:', 22390: '1-', 22395: '1_',
    22400: '1<', 22405: '1>', 22410: '20', 22415: '2A', 22420: '2B', 22425: '2C', 22430: '2D', 22435: '2E', 22440: '2F', 22445: '2G',
    22450: '2H', 22455: '2I', 22460: '2J', 22465: '2K', 22470: '2L', 22475: '2M', 22480: '2N', 22485: '2O', 22490: '2P', 22495: '2Q',
    22500: '2R', 22505: '2S', 22510: '2T', 22515: '2U', 22520: '2V', 22525: '2W', 22530: '2X', 22535: '2Y', 22540: '2Z', 22545: '2a',
    22550: '2b', 22555: '2c', 22560: '2d', 22565: '2e', 22570: '2f', 22575: '2g', 22580: '2h', 22585: '2i', 22590: '2j', 22595: '2k',
    22600: '2l', 22605: '2m', 22610: '2n', 22615: '2o', 22620: '2p', 22625: '2q', 22630: '2r', 22635: '2s', 22640: '2t', 22645: '2u',
    22650: '2v', 22655: '2w', 22660: '2x', 22665: '2y', 22670: '2z', 22675: '21', 22680: '22', 22685: '23', 22690: '24', 22695: '25',
    22700: '26', 22705: '27', 22710: '28', 22715: '29', 22720: '2+', 22725: '2/', 22730: '2!', 22735: '2@', 22740: '2#', 22745: '2$',
    22750: '2%', 22755: '2&', 22760: '2(', 22765: '2)', 22770: '2=', 22775: '2?', 22780: '2*', 22785: '2,', 22790: '2.', 22795: '2;',
    22800: '2:', 22805: '2-', 22810: '2_', 22815: '2<', 22820: '2>', 22825: '30', 22830: '3A', 22835: '3B', 22840: '3C', 22845: '3D',
    22850: '3E', 22855: '3F', 22860: '3G', 22865: '3H', 22870: '3I', 22875: '3J', 22880: '3K', 22885: '3L', 22890: '3M', 22895: '3N',
    22900: '3O', 22905: '3P', 22910: '3Q', 22915: '3R', 22920: '3S', 22925: '3T', 22930: '3U', 22935: '3V', 22940: '3W', 22945: '3X',
    22950: '3Y', 22955: '3Z', 22960: '3a', 22965: '3b', 22970: '3c', 22975: '3d', 22980: '3e', 22985: '3f', 22990: '3g', 22995: '3h',
    23000: '3i', 23005: '3j', 23010: '3k', 23015: '3l', 23020: '3m', 23025: '3n', 23030: '3o', 23035: '3p', 23040: '3q', 23045: '3r',
    23050: '3s', 23055: '3t', 23060: '3u', 23065: '3v', 23070: '3w', 23075: '3x', 23080: '3y', 23085: '3z', 23090: '31', 23095: '32',
    23100: '33', 23105: '34', 23110: '35', 23115: '36', 23120: '37', 23125: '38', 23130: '39', 23135: '3+', 23140: '3/', 23145: '3!',
    23150: '3@', 23155: '3#', 23160: '3$', 23165: '3%', 23170: '3&', 23175: '3(', 23180: '3)', 23185: '3=', 23190: '3?', 23195: '3*',
    23200: '3,', 23205: '3.', 23210: '3;', 23215: '3:', 23220: '3-', 23225: '3_', 23230: '3<', 23235: '3>', 23240: '40', 23245: '4A',
    23250: '4B', 23255: '4C', 23260: '4D', 23265: '4E', 23270: '4F', 23275: '4G', 23280: '4H', 23285: '4I', 23290: '4J', 23295: '4K',
    23300: '4L', 23305: '4M', 23310: '4N', 23315: '4O', 23320: '4P', 23325: '4Q', 23330: '4R', 23335: '4S', 23340: '4T', 23345: '4U',
    23350: '4V', 23355: '4W', 23360: '4X', 23365: '4Y', 23370: '4Z', 23375: '4a', 23380: '4b', 23385: '4c', 23390: '4d', 23395: '4e',
    23400: '4f', 23405: '4g', 23410: '4h', 23415: '4i', 23420: '4j', 23425: '4k', 23430: '4l', 23435: '4m', 23440: '4n', 23445: '4o',
    23450: '4p', 23455: '4q', 23460: '4r', 23465: '4s', 23470: '4t', 23475: '4u', 23480: '4v', 23485: '4w', 23490: '4x', 23495: '4y',
    23500: '4z', 23505: '41', 23510: '42', 23515: '43', 23520: '44', 23525: '45', 23530: '46', 23535: '47', 23540: '48', 23545: '49',
    23550: '4+', 23555: '4/', 23560: '4!', 23565: '4@', 23570: '4#', 23575: '4$', 23580: '4%', 23585: '4&', 23590: '4(', 23595: '4)',
    23600: '4=', 23605: '4?', 23610: '4*', 23615: '4,', 23620: '4.', 23625: '4;', 23630: '4:', 23635: '4-', 23640: '4_', 23645: '4<',
    23650: '4>', 23655: '50', 23660: '5A', 23665: '5B', 23670: '5C', 23675: '5D', 23680: '5E', 23685: '5F', 23690: '5G', 23695: '5H',
    23700: '5I', 23705: '5J', 23710: '5K', 23715: '5L', 23720: '5M', 23725: '5N', 23730: '5O', 23735: '5P', 23740: '5Q', 23745: '5R',
    23750: '5S', 23755: '5T', 23760: '5U', 23765: '5V', 23770: '5W', 23775: '5X', 23780: '5Y', 23785: '5Z', 23790: '5a', 23795: '5b',
    23800: '5c', 23805: '5d', 23810: '5e', 23815: '5f', 23820: '5g', 23825: '5h', 23830: '5i', 23835: '5j', 23840: '5k', 23845: '5l',
    23850: '5m', 23855: '5n', 23860: '5o', 23865: '5p', 23870: '5q', 23875: '5r', 23880: '5s', 23885: '5t', 23890: '5u', 23895: '5v',
    23900: '5w', 23905: '5x', 23910: '5y', 23915: '5z', 23920: '51', 23925: '52', 23930: '53', 23935: '54', 23940: '55', 23945: '56',
    23950: '57', 23955: '58', 23960: '59', 23965: '5+', 23970: '5/', 23975: '5!', 23980: '5@', 23985: '5#', 23990: '5$', 23995: '5%',
    24000: '5&', 24005: '5(', 24010: '5)', 24015: '5=', 24020: '5?', 24025: '5*', 24030: '5,', 24035: '5.', 24040: '5;', 24045: '5:',
    24050: '5-', 24055: '5_', 24060: '5<', 24065: '5>', 24070: '60', 24075: '6A', 24080: '6B', 24085: '6C', 24090: '6D', 24095: '6E',
    24100: '6F', 24105: '6G', 24110: '6H', 24115: '6I', 24120: '6J', 24125: '6K', 24130: '6L', 24135: '6M', 24140: '6N', 24145: '6O',
    24150: '6P', 24155: '6Q', 24160: '6R', 24165: '6S', 24170: '6T', 24175: '6U', 24180: '6V', 24185: '6W', 24190: '6X', 24195: '6Y',
    24200: '6Z', 24205: '6a', 24210: '6b', 24215: '6c', 24220: '6d', 24225: '6e', 24230: '6f', 24235: '6g', 24240: '6h', 24245: '6i',
    24250: '6j', 24255: '6k', 24260: '6l', 24265: '6m', 24270: '6n', 24275: '6o', 24280: '6p', 24285: '6q', 24290: '6r', 24295: '6s',
    24300: '6t', 24305: '6u', 24310: '6v', 24315: '6w', 24320: '6x', 24325: '6y', 24330: '6z', 24335: '61', 24340: '62', 24345: '63',
    24350: '64', 24355: '65', 24360: '66', 24365: '67', 24370: '68', 24375: '69', 24380: '6+', 24385: '6/', 24390: '6!', 24395: '6@',
    24400: '6#', 24405: '6$', 24410: '6%', 24415: '6&', 24420: '6(', 24425: '6)', 24430: '6=', 24435: '6?', 24440: '6*', 24445: '6,',
    24450: '6.', 24455: '6;', 24460: '6:', 24465: '6-', 24470: '6_', 24475: '6<', 24480: '6>', 24485: '70', 24490: '7A', 24495: '7B',
    24500: '7C', 24505: '7D', 24510: '7E', 24515: '7F', 24520: '7G', 24525: '7H', 24530: '7I', 24535: '7J', 24540: '7K', 24545: '7L',
    24550: '7M', 24555: '7N', 24560: '7O', 24565: '7P', 24570: '7Q', 24575: '7R', 24580: '7S', 24585: '7T', 24590: '7U', 24595: '7V',
    24600: '7W', 24605: '7X', 24610: '7Y', 24615: '7Z', 24620: '7a', 24625: '7b', 24630: '7c', 24635: '7d', 24640: '7e', 24645: '7f',
    24650: '7g', 24655: '7h', 24660: '7i', 24665: '7j', 24670: '7k', 24675: '7l', 24680: '7m', 24685: '7n', 24690: '7o', 24695: '7p',
    24700: '7q', 24705: '7r', 24710: '7s', 24715: '7t', 24720: '7u', 24725: '7v', 24730: '7w', 24735: '7x', 24740: '7y', 24745: '7z',
    24750: '71', 24755: '72', 24760: '73', 24765: '74', 24770: '75', 24775: '76', 24780: '77', 24785: '78', 24790: '79', 24795: '7+',
    24800: '7/', 24805: '7!', 24810: '7@', 24815: '7#', 24820: '7$', 24825: '7%', 24830: '7&', 24835: '7(', 24840: '7)', 24845: '7=',
    24850: '7?', 24855: '7*', 24860: '7,', 24865: '7.', 24870: '7;', 24875: '7:', 24880: '7-', 24885: '7_', 24890: '7<', 24895: '7>',
    24900: '80', 24905: '8A', 24910: '8B', 24915: '8C', 24920: '8D', 24925: '8E', 24930: '8F', 24935: '8G', 24940: '8H', 24945: '8I',
    24950: '8J', 24955: '8K', 24960: '8L', 24965: '8M', 24970: '8N', 24975: '8O', 24980: '8P', 24985: '8Q', 24990: '8R', 24995: '8S',
    25000: '8T', 25005: '8U', 25010: '8V', 25015: '8W', 25020: '8X', 25025: '8Y', 25030: '8Z', 25035: '8a', 25040: '8b', 25045: '8c',
    25050: '8d', 25055: '8e', 25060: '8f', 25065: '8g', 25070: '8h', 25075: '8i', 25080: '8j', 25085: '8k', 25090: '8l', 25095: '8m',
    25100: '8n', 25105: '8o', 25110: '8p', 25115: '8q', 25120: '8r', 25125: '8s', 25130: '8t', 25135: '8u', 25140: '8v', 25145: '8w',
    25150: '8x', 25155: '8y', 25160: '8z', 25165: '81', 25170: '82', 25175: '83', 25180: '84', 25185: '85', 25190: '86', 25195: '87',
    25200: '88', 25205: '89', 25210: '8+', 25215: '8/', 25220: '8!', 25225: '8@', 25230: '8#', 25235: '8$', 25240: '8%', 25245: '8&',
    25250: '8(', 25255: '8)', 25260: '8=', 25265: '8?', 25270: '8*', 25275: '8,', 25280: '8.', 25285: '8;', 25290: '8:', 25295: '8-',
    25300: '8_', 25305: '8<', 25310: '8>', 25315: '90', 25320: '9A', 25325: '9B', 25330: '9C', 25335: '9D', 25340: '9E', 25345: '9F',
    25350: '9G', 25355: '9H', 25360: '9I', 25365: '9J', 25370: '9K', 25375: '9L', 25380: '9M', 25385: '9N', 25390: '9O', 25395: '9P',
    25400: '9Q', 25405: '9R', 25410: '9S', 25415: '9T', 25420: '9U', 25425: '9V', 25430: '9W', 25435: '9X', 25440: '9Y', 25445: '9Z',
    25450: '9a', 25455: '9b', 25460: '9c', 25465: '9d', 25470: '9e', 25475: '9f', 25480: '9g', 25485: '9h', 25490: '9i', 25495: '9j',
    25500: '9k', 25505: '9l', 25510: '9m', 25515: '9n', 25520: '9o', 25525: '9p', 25530: '9q', 25535: '9r', 25540: '9s', 25545: '9t',
    25550: '9u', 25555: '9v', 25560: '9w', 25565: '9x', 25570: '9y', 25575: '9z', 25580: '91', 25585: '92', 25590: '93', 25595: '94',
    25600: '95', 25605: '96', 25610: '97', 25615: '98', 25620: '99', 25625: '9+', 25630: '9/', 25635: '9!', 25640: '9@', 25645: '9#',
    25650: '9$', 25655: '9%', 25660: '9&', 25665: '9(', 25670: '9)', 25675: '9=', 25680: '9?', 25685: '9*', 25690: '9,', 25695: '9.',
    25700: '9;', 25705: '9:', 25710: '9-', 25715: '9_', 25720: '9<', 25725: '9>', 25730: '+0', 25735: '+A', 25740: '+B', 25745: '+C',
    25750: '+D', 25755: '+E', 25760: '+F', 25765: '+G', 25770: '+H', 25775: '+I', 25780: '+J', 25785: '+K', 25790: '+L', 25795: '+M',
    25800: '+N', 25805: '+O', 25810: '+P', 25815: '+Q', 25820: '+R', 25825: '+S', 25830: '+T', 25835: '+U', 25840: '+V', 25845: '+W',
    25850: '+X', 25855: '+Y', 25860: '+Z', 25865: '+a', 25870: '+b', 25875: '+c', 25880: '+d', 25885: '+e', 25890: '+f', 25895: '+g',
    25900: '+h', 25905: '+i', 25910: '+j', 25915: '+k', 25920: '+l', 25925: '+m', 25930: '+n', 25935: '+o', 25940: '+p', 25945: '+q',
    25950: '+r', 25955: '+s', 25960: '+t', 25965: '+u', 25970: '+v', 25975: '+w', 25980: '+x', 25985: '+y', 25990: '+z', 25995: '+1',
    26000: '+2', 26005: '+3', 26010: '+4', 26015: '+5', 26020: '+6', 26025: '+7', 26030: '+8', 26035: '+9', 26040: '++', 26045: '+/',
    26050: '+!', 26055: '+@', 26060: '+#', 26065: '+$', 26070: '+%', 26075: '+&', 26080: '+(', 26085: '+)', 26090: '+=', 26095: '+?',
    26100: '+*', 26105: '+,', 26110: '+.', 26115: '+;', 26120: '+:', 26125: '+-', 26130: '+_', 26135: '+<', 26140: '+>', 26145: '/0',
    26150: '/A', 26155: '/B', 26160: '/C', 26165: '/D', 26170: '/E', 26175: '/F', 26180: '/G', 26185: '/H', 26190: '/I', 26195: '/J',
    26200: '/K', 26205: '/L', 26210: '/M', 26215: '/N', 26220: '/O', 26225: '/P', 26230: '/Q', 26235: '/R', 26240: '/S', 26245: '/T',
    26250: '/U', 26255: '/V', 26260: '/W', 26265: '/X', 26270: '/Y', 26275: '/Z', 26280: '/a', 26285: '/b', 26290: '/c', 26295: '/d',
    26300: '/e', 26305: '/f', 26310: '/g', 26315: '/h', 26320: '/i', 26325: '/j', 26330: '/k', 26335: '/l', 26340: '/m', 26345: '/n',
    26350: '/o', 26355: '/p', 26360: '/q', 26365: '/r', 26370: '/s', 26375: '/t', 26380: '/u', 26385: '/v', 26390: '/w', 26395: '/x',
    26400: '/y', 26405: '/z', 26410: '/1', 26415: '/2', 26420: '/3', 26425: '/4', 26430: '/5', 26435: '/6', 26440: '/7', 26445: '/8',
    26450: '/9', 26455: '/+', 26460: '//', 26465: '/!', 26470: '/@', 26475: '/#', 26480: '/$', 26485: '/%', 26490: '/&', 26495: '/(',
    26500: '/)', 26505: '/=', 26510: '/?', 26515: '/*', 26520: '/,', 26525: '/.', 26530: '/;', 26535: '/:', 26540: '/-', 26545: '/_',
    26550: '/<', 26555: '/>', 26560: '!0', 26565: '!A', 26570: '!B', 26575: '!C', 26580: '!D', 26585: '!E', 26590: '!F', 26595: '!G',
    26600: '!H', 26605: '!I', 26610: '!J', 26615: '!K', 26620: '!L', 26625: '!M', 26630: '!N', 26635: '!O', 26640: '!P', 26645: '!Q',
    26650: '!R', 26655: '!S', 26660: '!T', 26665: '!U', 26670: '!V', 26675: '!W', 26680: '!X', 26685: '!Y', 26690: '!Z', 26695: '!a',
    26700: '!b', 26705: '!c', 26710: '!d', 26715: '!e', 26720: '!f', 26725: '!g', 26730: '!h', 26735: '!i', 26740: '!j', 26745: '!k',
    26750: '!l', 26755: '!m', 26760: '!n', 26765: '!o', 26770: '!p', 26775: '!q', 26780: '!r', 26785: '!s', 26790: '!t', 26795: '!u',
    26800: '!v', 26805: '!w', 26810: '!x', 26815: '!y', 26820: '!z', 26825: '!1', 26830: '!2', 26835: '!3', 26840: '!4', 26845: '!5',
    26850: '!6', 26855: '!7', 26860: '!8', 26865: '!9', 26870: '!+', 26875: '!/', 26880: '!!', 26885: '!@', 26890: '!#', 26895: '!$',
    26900: '!%', 26905: '!&', 26910: '!(', 26915: '!)', 26920: '!=', 26925: '!?', 26930: '!*', 26935: '!,', 26940: '!.', 26945: '!;',
    26950: '!:', 26955: '!-', 26960: '!_', 26965: '!<', 26970: '!>', 26975: '@0', 26980: '@A', 26985: '@B', 26990: '@C', 26995: '@D',
    27000: '@E', 27005: '@F', 27010: '@G', 27015: '@H', 27020: '@I', 27025: '@J', 27030: '@K', 27035: '@L', 27040: '@M', 27045: '@N',
    27050: '@O', 27055: '@P', 27060: '@Q', 27065: '@R', 27070: '@S', 27075: '@T', 27080: '@U', 27085: '@V', 27090: '@W', 27095: '@X',
    27100: '@Y', 27105: '@Z', 27110: '@a', 27115: '@b', 27120: '@c', 27125: '@d', 27130: '@e', 27135: '@f', 27140: '@g', 27145: '@h',
    27150: '@i', 27155: '@j', 27160: '@k', 27165: '@l', 27170: '@m', 27175: '@n', 27180: '@o', 27185: '@p', 27190: '@q', 27195: '@r',
    27200: '@s', 27205: '@t', 27210: '@u', 27215: '@v', 27220: '@w', 27225: '@x', 27230: '@y', 27235: '@z', 27240: '@1', 27245: '@2',
    27250: '@3', 27255: '@4', 27260: '@5', 27265: '@6', 27270: '@7', 27275: '@8', 27280: '@9', 27285: '@+', 27290: '@/', 27295: '@!',
    27300: '@@', 27305: '@#', 27310: '@$', 27315: '@%', 27320: '@&', 27325: '@(', 27330: '@)', 27335: '@=', 27340: '@?', 27345: '@*',
    27350: '@,', 27355: '@.', 27360: '@;', 27365: '@:', 27370: '@-', 27375: '@_', 27380: '@<', 27385: '@>', 27390: '#0', 27395: '#A',
    27400: '#B', 27405: '#C', 27410: '#D', 27415: '#E', 27420: '#F', 27425: '#G', 27430: '#H', 27435: '#I', 27440: '#J', 27445: '#K',
    27450: '#L', 27455: '#M', 27460: '#N', 27465: '#O', 27470: '#P', 27475: '#Q', 27480: '#R', 27485: '#S', 27490: '#T', 27495: '#U',
    27500: '#V', 27505: '#W', 27510: '#X', 27515: '#Y', 27520: '#Z', 27525: '#a', 27530: '#b', 27535: '#c', 27540: '#d', 27545: '#e',
    27550: '#f', 27555: '#g', 27560: '#h', 27565: '#i', 27570: '#j', 27575: '#k', 27580: '#l', 27585: '#m', 27590: '#n', 27595: '#o',
    27600: '#p', 27605: '#q', 27610: '#r', 27615: '#s', 27620: '#t', 27625: '#u', 27630: '#v', 27635: '#w', 27640: '#x', 27645: '#y',
    27650: '#z', 27655: '#1', 27660: '#2', 27665: '#3', 27670: '#4', 27675: '#5', 27680: '#6', 27685: '#7', 27690: '#8', 27695: '#9',
    27700: '#+', 27705: '#/', 27710: '#!', 27715: '#@', 27720: '##', 27725: '#$', 27730: '#%', 27735: '#&', 27740: '#(', 27745: '#)',
    27750: '#=', 27755: '#?', 27760: '#*', 27765: '#,', 27770: '#.', 27775: '#;', 27780: '#:', 27785: '#-', 27790: '#_', 27795: '#<',
    27800: '#>', 27805: '$0', 27810: '$A', 27815: '$B', 27820: '$C', 27825: '$D', 27830: '$E', 27835: '$F', 27840: '$G', 27845: '$H',
    27850: '$I', 27855: '$J', 27860: '$K', 27865: '$L', 27870: '$M', 27875: '$N', 27880: '$O', 27885: '$P', 27890: '$Q', 27895: '$R',
    27900: '$S', 27905: '$T', 27910: '$U', 27915: '$V', 27920: '$W', 27925: '$X', 27930: '$Y', 27935: '$Z', 27940: '$a', 27945: '$b',
    27950: '$c', 27955: '$d', 27960: '$e', 27965: '$f', 27970: '$g', 27975: '$h', 27980: '$i', 27985: '$j', 27990: '$k', 27995: '$l',
    28000: '$m', 28005: '$n', 28010: '$o', 28015: '$p', 28020: '$q', 28025: '$r', 28030: '$s', 28035: '$t', 28040: '$u', 28045: '$v',
    28050: '$w', 28055: '$x', 28060: '$y', 28065: '$z', 28070: '$1', 28075: '$2', 28080: '$3', 28085: '$4', 28090: '$5', 28095: '$6',
    28100: '$7', 28105: '$8', 28110: '$9', 28115: '$+', 28120: '$/', 28125: '$!', 28130: '$@', 28135: '$#', 28140: '$$', 28145: '$%',
    28150: '$&', 28155: '$(', 28160: '$)', 28165: '$=', 28170: '$?', 28175: '$*', 28180: '$,', 28185: '$.', 28190: '$;', 28195: '$:',
    28200: '$-', 28205: '$_', 28210: '$<', 28215: '$>', 28220: '%0', 28225: '%A', 28230: '%B', 28235: '%C', 28240: '%D', 28245: '%E',
    28250: '%F', 28255: '%G', 28260: '%H', 28265: '%I', 28270: '%J', 28275: '%K', 28280: '%L', 28285: '%M', 28290: '%N', 28295: '%O',
    28300: '%P', 28305: '%Q', 28310: '%R', 28315: '%S', 28320: '%T', 28325: '%U', 28330: '%V', 28335: '%W', 28340: '%X', 28345: '%Y',
    28350: '%Z', 28355: '%a', 28360: '%b', 28365: '%c', 28370: '%d', 28375: '%e', 28380: '%f', 28385: '%g', 28390: '%h', 28395: '%i',
    28400: '%j', 28405: '%k', 28410: '%l', 28415: '%m', 28420: '%n', 28425: '%o', 28430: '%p', 28435: '%q', 28440: '%r', 28445: '%s',
    28450: '%t', 28455: '%u', 28460: '%v', 28465: '%w', 28470: '%x', 28475: '%y', 28480: '%z', 28485: '%1', 28490: '%2', 28495: '%3',
    28500: '%4', 28505: '%5', 28510: '%6', 28515: '%7', 28520: '%8', 28525: '%9', 28530: '%+', 28535: '%/', 28540: '%!', 28545: '%@',
    28550: '%#', 28555: '%$', 28560: '%%', 28565: '%&', 28570: '%(', 28575: '%)', 28580: '%=', 28585: '%?', 28590: '%*', 28595: '%,',
    28600: '%.', 28605: '%;', 28610: '%:', 28615: '%-', 28620: '%_', 28625: '%<', 28630: '%>', 28635: '&0', 28640: '&A', 28645: '&B',
    28650: '&C', 28655: '&D', 28660: '&E', 28665: '&F', 28670: '&G', 28675: '&H', 28680: '&I', 28685: '&J', 28690: '&K', 28695: '&L',
    28700: '&M', 28705: '&N', 28710: '&O', 28715: '&P', 28720: '&Q', 28725: '&R', 28730: '&S', 28735: '&T', 28740: '&U', 28745: '&V',
    28750: '&W', 28755: '&X', 28760: '&Y', 28765: '&Z', 28770: '&a', 28775: '&b', 28780: '&c', 28785: '&d', 28790: '&e', 28795: '&f',
    28800: '&g', 28805: '&h', 28810: '&i', 28815: '&j', 28820: '&k', 28825: '&l', 28830: '&m', 28835: '&n', 28840: '&o', 28845: '&p',
    28850: '&q', 28855: '&r', 28860: '&s', 28865: '&t', 28870: '&u', 28875: '&v', 28880: '&w', 28885: '&x', 28890: '&y', 28895: '&z',
    28900: '&1', 28905: '&2', 28910: '&3', 28915: '&4', 28920: '&5', 28925: '&6', 28930: '&7', 28935: '&8', 28940: '&9', 28945: '&+',
    28950: '&/', 28955: '&!', 28960: '&@', 28965: '&#', 28970: '&$', 28975: '&%', 28980: '&&', 28985: '&(', 28990: '&)', 28995: '&=',
    29000: '&?', 29005: '&*', 29010: '&,', 29015: '&.', 29020: '&;', 29025: '&:', 29030: '&-', 29035: '&_', 29040: '&<', 29045: '&>',
    29050: '(0', 29055: '(A', 29060: '(B', 29065: '(C', 29070: '(D', 29075: '(E', 29080: '(F', 29085: '(G', 29090: '(H', 29095: '(I',
    29100: '(J', 29105: '(K', 29110: '(L', 29115: '(M', 29120: '(N', 29125: '(O', 29130: '(P', 29135: '(Q', 29140: '(R', 29145: '(S',
    29150: '(T', 29155: '(U', 29160: '(V', 29165: '(W', 29170: '(X', 29175: '(Y', 29180: '(Z', 29185: '(a', 29190: '(b', 29195: '(c',
    29200: '(d', 29205: '(e', 29210: '(f', 29215: '(g', 29220: '(h', 29225: '(i', 29230: '(j', 29235: '(k', 29240: '(l', 29245: '(m',
    29250: '(n', 29255: '(o', 29260: '(p', 29265: '(q', 29270: '(r', 29275: '(s', 29280: '(t', 29285: '(u', 29290: '(v', 29295: '(w',
    29300: '(x', 29305: '(y', 29310: '(z', 29315: '(1', 29320: '(2', 29325: '(3', 29330: '(4', 29335: '(5', 29340: '(6', 29345: '(7',
    29350: '(8', 29355: '(9', 29360: '(+', 29365: '(/', 29370: '(!', 29375: '(@', 29380: '(#', 29385: '($', 29390: '(%', 29395: '(&',
    29400: '((', 29405: '()', 29410: '(=', 29415: '(?', 29420: '(*', 29425: '(,', 29430: '(.', 29435: '(;', 29440: '(:', 29445: '(-',
    29450: '(_', 29455: '(<', 29460: '(>', 29465: ')0', 29470: ')A', 29475: ')B', 29480: ')C', 29485: ')D', 29490: ')E', 29495: ')F',
    29500: ')G', 29505: ')H', 29510: ')I', 29515: ')J', 29520: ')K', 29525: ')L', 29530: ')M', 29535: ')N', 29540: ')O', 29545: ')P',
    29550: ')Q', 29555: ')R', 29560: ')S', 29565: ')T', 29570: ')U', 29575: ')V', 29580: ')W', 29585: ')X', 29590: ')Y', 29595: ')Z',
    29600: ')a', 29605: ')b', 29610: ')c', 29615: ')d', 29620: ')e', 29625: ')f', 29630: ')g', 29635: ')h', 29640: ')i', 29645: ')j',
    29650: ')k', 29655: ')l', 29660: ')m', 29665: ')n', 29670: ')o', 29675: ')p', 29680: ')q', 29685: ')r', 29690: ')s', 29695: ')t',
    29700: ')u', 29705: ')v', 29710: ')w', 29715: ')x', 29720: ')y', 29725: ')z', 29730: ')1', 29735: ')2', 29740: ')3', 29745: ')4',
    29750: ')5', 29755: ')6', 29760: ')7', 29765: ')8', 29770: ')9', 29775: ')+', 29780: ')/', 29785: ')!', 29790: ')@', 29795: ')#',
    29800: ')$', 29805: ')%', 29810: ')&', 29815: ')(', 29820: '))', 29825: ')=', 29830: ')?', 29835: ')*', 29840: '),', 29845: ').',
    29850: ');', 29855: '):', 29860: ')-', 29865: ')_', 29870: ')<', 29875: ')>', 29880: '=0', 29885: '=A', 29890: '=B', 29895: '=C',
    29900: '=D', 29905: '=E', 29910: '=F', 29915: '=G', 29920: '=H', 29925: '=I', 29930: '=J', 29935: '=K', 29940: '=L', 29945: '=M',
    29950: '=N', 29955: '=O', 29960: '=P', 29965: '=Q', 29970: '=R', 29975: '=S', 29980: '=T', 29985: '=U', 29990: '=V', 29995: '=W',
    30000: '=X', 30005: '=Y', 30010: '=Z', 30015: '=a', 30020: '=b', 30025: '=c', 30030: '=d', 30035: '=e', 30040: '=f', 30045: '=g',
    30050: '=h', 30055: '=i', 30060: '=j', 30065: '=k', 30070: '=l', 30075: '=m', 30080: '=n', 30085: '=o', 30090: '=p', 30095: '=q',
    30100: '=r', 30105: '=s', 30110: '=t', 30115: '=u', 30120: '=v', 30125: '=w', 30130: '=x', 30135: '=y', 30140: '=z', 30145: '=1',
    30150: '=2', 30155: '=3', 30160: '=4', 30165: '=5', 30170: '=6', 30175: '=7', 30180: '=8', 30185: '=9', 30190: '=+', 30195: '=/',
    30200: '=!', 30205: '=@', 30210: '=#', 30215: '=$', 30220: '=%', 30225: '=&', 30230: '=(', 30235: '=)', 30240: '==', 30245: '=?',
    30250: '=*', 30255: '=,', 30260: '=.', 30265: '=;', 30270: '=:', 30275: '=-', 30280: '=_', 30285: '=<', 30290: '=>', 30295: '?0',
    30300: '?A', 30305: '?B', 30310: '?C', 30315: '?D', 30320: '?E', 30325: '?F', 30330: '?G', 30335: '?H', 30340: '?I', 30345: '?J',
    30350: '?K', 30355: '?L', 30360: '?M', 30365: '?N', 30370: '?O', 30375: '?P', 30380: '?Q', 30385: '?R', 30390: '?S', 30395: '?T',
    30400: '?U', 30405: '?V', 30410: '?W', 30415: '?X', 30420: '?Y', 30425: '?Z', 30430: '?a', 30435: '?b', 30440: '?c', 30445: '?d',
    30450: '?e', 30455: '?f', 30460: '?g', 30465: '?h', 30470: '?i', 30475: '?j', 30480: '?k', 30485: '?l', 30490: '?m', 30495: '?n',
    30500: '?o', 30505: '?p', 30510: '?q', 30515: '?r', 30520: '?s', 30525: '?t', 30530: '?u', 30535: '?v', 30540: '?w', 30545: '?x',
    30550: '?y', 30555: '?z', 30560: '?1', 30565: '?2', 30570: '?3', 30575: '?4', 30580: '?5', 30585: '?6', 30590: '?7', 30595: '?8',
    30600: '?9', 30605: '?+', 30610: '?/', 30615: '?!', 30620: '?@', 30625: '?#', 30630: '?$', 30635: '?%', 30640: '?&', 30645: '?(',
    30650: '?)', 30655: '?=', 30660: '??', 30665: '?*', 30670: '?,', 30675: '?.', 30680: '?;', 30685: '?:', 30690: '?-', 30695: '?_',
    30700: '?<', 30705: '?>', 30710: '*0', 30715: '*A', 30720: '*B', 30725: '*C', 30730: '*D', 30735: '*E', 30740: '*F', 30745: '*G',
    30750: '*H', 30755: '*I', 30760: '*J', 30765: '*K', 30770: '*L', 30775: '*M', 30780: '*N', 30785: '*O', 30790: '*P', 30795: '*Q',
    30800: '*R', 30805: '*S', 30810: '*T', 30815: '*U', 30820: '*V', 30825: '*W', 30830: '*X', 30835: '*Y', 30840: '*Z', 30845: '*a',
    30850: '*b', 30855: '*c', 30860: '*d', 30865: '*e', 30870: '*f', 30875: '*g', 30880: '*h', 30885: '*i', 30890: '*j', 30895: '*k',
    30900: '*l', 30905: '*m', 30910: '*n', 30915: '*o', 30920: '*p', 30925: '*q', 30930: '*r', 30935: '*s', 30940: '*t', 30945: '*u',
    30950: '*v', 30955: '*w', 30960: '*x', 30965: '*y', 30970: '*z', 30975: '*1', 30980: '*2', 30985: '*3', 30990: '*4', 30995: '*5',
    31000: '*6', 31005: '*7', 31010: '*8', 31015: '*9', 31020: '*+', 31025: '*/', 31030: '*!', 31035: '*@', 31040: '*#', 31045: '*$',
    31050: '*%', 31055: '*&', 31060: '*(', 31065: '*)', 31070: '*=', 31075: '*?', 31080: '**', 31085: '*,', 31090: '*.', 31095: '*;',
    31100: '*:', 31105: '*-', 31110: '*_', 31115: '*<', 31120: '*>', 31125: ',0', 31130: ',A', 31135: ',B', 31140: ',C', 31145: ',D',
    31150: ',E', 31155: ',F', 31160: ',G', 31165: ',H', 31170: ',I', 31175: ',J', 31180: ',K', 31185: ',L', 31190: ',M', 31195: ',N',
    31200: ',O', 31205: ',P', 31210: ',Q', 31215: ',R', 31220: ',S', 31225: ',T', 31230: ',U', 31235: ',V', 31240: ',W', 31245: ',X',
    31250: ',Y', 31255: ',Z', 31260: ',a', 31265: ',b', 31270: ',c', 31275: ',d', 31280: ',e', 31285: ',f', 31290: ',g', 31295: ',h',
    31300: ',i', 31305: ',j', 31310: ',k', 31315: ',l', 31320: ',m', 31325: ',n', 31330: ',o', 31335: ',p', 31340: ',q', 31345: ',r',
    31350: ',s', 31355: ',t', 31360: ',u', 31365: ',v', 31370: ',w', 31375: ',x', 31380: ',y', 31385: ',z', 31390: ',1', 31395: ',2',
    31400: ',3', 31405: ',4', 31410: ',5', 31415: ',6', 31420: ',7', 31425: ',8', 31430: ',9', 31435: ',+', 31440: ',/', 31445: ',!',
    31450: ',@', 31455: ',#', 31460: ',$', 31465: ',%', 31470: ',&', 31475: ',(', 31480: ',)', 31485: ',=', 31490: ',?', 31495: ',*',
    31500: ',,', 31505: ',.', 31510: ',;', 31515: ',:', 31520: ',-', 31525: ',_', 31530: ',<', 31535: ',>', 31540: '.0', 31545: '.A',
    31550: '.B', 31555: '.C', 31560: '.D', 31565: '.E', 31570: '.F', 31575: '.G', 31580: '.H', 31585: '.I', 31590: '.J', 31595: '.K',
    31600: '.L', 31605: '.M', 31610: '.N', 31615: '.O', 31620: '.P', 31625: '.Q', 31630: '.R', 31635: '.S', 31640: '.T', 31645: '.U',
    31650: '.V', 31655: '.W', 31660: '.X', 31665: '.Y', 31670: '.Z', 31675: '.a', 31680: '.b', 31685: '.c', 31690: '.d', 31695: '.e',
    31700: '.f', 31705: '.g', 31710: '.h', 31715: '.i', 31720: '.j', 31725: '.k', 31730: '.l', 31735: '.m', 31740: '.n', 31745: '.o',
    31750: '.p', 31755: '.q', 31760: '.r', 31765: '.s', 31770: '.t', 31775: '.u', 31780: '.v', 31785: '.w', 31790: '.x', 31795: '.y',
    31800: '.z', 31805: '.1', 31810: '.2', 31815: '.3', 31820: '.4', 31825: '.5', 31830: '.6', 31835: '.7', 31840: '.8', 31845: '.9',
    31850: '.+', 31855: './', 31860: '.!', 31865: '.@', 31870: '.#', 31875: '.$', 31880: '.%', 31885: '.&', 31890: '.(', 31895: '.)',
    31900: '.=', 31905: '.?', 31910: '.*', 31915: '.,', 31920: '..', 31925: '.;', 31930: '.:', 31935: '.-', 31940: '._', 31945: '.<',
    31950: '.>', 31955: ';0', 31960: ';A', 31965: ';B', 31970: ';C', 31975: ';D', 31980: ';E', 31985: ';F', 31990: ';G', 31995: ';H',
    32000: ';I', 32005: ';J', 32010: ';K', 32015: ';L', 32020: ';M', 32025: ';N', 32030: ';O', 32035: ';P', 32040: ';Q', 32045: ';R',
    32050: ';S', 32055: ';T', 32060: ';U', 32065: ';V', 32070: ';W', 32075: ';X', 32080: ';Y', 32085: ';Z', 32090: ';a', 32095: ';b',
    32100: ';c', 32105: ';d', 32110: ';e', 32115: ';f', 32120: ';g', 32125: ';h', 32130: ';i', 32135: ';j', 32140: ';k', 32145: ';l',
    32150: ';m', 32155: ';n', 32160: ';o', 32165: ';p', 32170: ';q', 32175: ';r', 32180: ';s', 32185: ';t', 32190: ';u', 32195: ';v',
    32200: ';w', 32205: ';x', 32210: ';y', 32215: ';z', 32220: ';1', 32225: ';2', 32230: ';3', 32235: ';4', 32240: ';5', 32245: ';6',
    32250: ';7', 32255: ';8', 32260: ';9', 32265: ';+', 32270: ';/', 32275: ';!', 32280: ';@', 32285: ';#', 32290: ';$', 32295: ';%',
    32300: ';&', 32305: ';(', 32310: ';)', 32315: ';=', 32320: ';?', 32325: ';*', 32330: ';,', 32335: ';.', 32340: ';;', 32345: ';:',
    32350: ';-', 32355: ';_', 32360: ';<', 32365: ';>', 32370: ':0', 32375: ':A', 32380: ':B', 32385: ':C', 32390: ':D', 32395: ':E',
    32400: ':F', 32405: ':G', 32410: ':H', 32415: ':I', 32420: ':J', 32425: ':K', 32430: ':L', 32435: ':M', 32440: ':N', 32445: ':O',
    32450: ':P', 32455: ':Q', 32460: ':R', 32465: ':S', 32470: ':T', 32475: ':U', 32480: ':V', 32485: ':W', 32490: ':X', 32495: ':Y',
    32500: ':Z', 32505: ':a', 32510: ':b', 32515: ':c', 32520: ':d', 32525: ':e', 32530: ':f', 32535: ':g', 32540: ':h', 32545: ':i',
    32550: ':j', 32555: ':k', 32560: ':l', 32565: ':m', 32570: ':n', 32575: ':o', 32580: ':p', 32585: ':q', 32590: ':r', 32595: ':s',
    32600: ':t', 32605: ':u', 32610: ':v', 32615: ':w', 32620: ':x', 32625: ':y', 32630: ':z', 32635: ':1', 32640: ':2', 32645: ':3',
    32650: ':4', 32655: ':5', 32660: ':6', 32665: ':7', 32670: ':8', 32675: ':9', 32680: ':+', 32685: ':/', 32690: ':!', 32695: ':@',
    32700: ':#', 32705: ':$', 32710: ':%', 32715: ':&', 32720: ':(', 32725: ':)', 32730: ':=', 32735: ':?', 32740: ':*', 32745: ':,',
    32750: ':.', 32755: ':;', 32760: '::', 32765: ':-', 32770: ':_', 32775: ':<', 32780: ':>', 32785: '-0', 32790: '-A', 32795: '-B',
    32800: '-C', 32805: '-D', 32810: '-E', 32815: '-F', 32820: '-G', 32825: '-H', 32830: '-I', 32835: '-J', 32840: '-K', 32845: '-L',
    32850: '-M', 32855: '-N', 32860: '-O', 32865: '-P', 32870: '-Q', 32875: '-R', 32880: '-S', 32885: '-T', 32890: '-U', 32895: '-V',
    32900: '-W', 32905: '-X', 32910: '-Y', 32915: '-Z', 32920: '-a', 32925: '-b', 32930: '-c', 32935: '-d', 32940: '-e', 32945: '-f',
    32950: '-g', 32955: '-h', 32960: '-i', 32965: '-j', 32970: '-k', 32975: '-l', 32980: '-m', 32985: '-n', 32990: '-o', 32995: '-p',
    33000: '-q', 33005: '-r', 33010: '-s', 33015: '-t', 33020: '-u', 33025: '-v', 33030: '-w', 33035: '-x', 33040: '-y', 33045: '-z',
    33050: '-1', 33055: '-2', 33060: '-3', 33065: '-4', 33070: '-5', 33075: '-6', 33080: '-7', 33085: '-8', 33090: '-9', 33095: '-+',
    33100: '-/', 33105: '-!', 33110: '-@', 33115: '-#', 33120: '-$', 33125: '-%', 33130: '-&', 33135: '-(', 33140: '-)', 33145: '-=',
    33150: '-?', 33155: '-*', 33160: '-,', 33165: '-.', 33170: '-;', 33175: '-:', 33180: '--', 33185: '-_', 33190: '-<', 33195: '->',
    33200: '_0', 33205: '_A', 33210: '_B', 33215: '_C', 33220: '_D', 33225: '_E', 33230: '_F', 33235: '_G', 33240: '_H', 33245: '_I',
    33250: '_J', 33255: '_K', 33260: '_L', 33265: '_M', 33270: '_N', 33275: '_O', 33280: '_P', 33285: '_Q', 33290: '_R', 33295: '_S',
    33300: '_T', 33305: '_U', 33310: '_V', 33315: '_W', 33320: '_X', 33325: '_Y', 33330: '_Z', 33335: '_a', 33340: '_b', 33345: '_c',
    33350: '_d', 33355: '_e', 33360: '_f', 33365: '_g', 33370: '_h', 33375: '_i', 33380: '_j', 33385: '_k', 33390: '_l', 33395: '_m',
    33400: '_n', 33405: '_o', 33410: '_p', 33415: '_q', 33420: '_r', 33425: '_s', 33430: '_t', 33435: '_u', 33440: '_v', 33445: '_w',
    33450: '_x', 33455: '_y', 33460: '_z', 33465: '_1', 33470: '_2', 33475: '_3', 33480: '_4', 33485: '_5', 33490: '_6', 33495: '_7',
    33500: '_8', 33505: '_9', 33510: '_+', 33515: '_/', 33520: '_!', 33525: '_@', 33530: '_#', 33535: '_$', 33540: '_%', 33545: '_&',
    33550: '_(', 33555: '_)', 33560: '_=', 33565: '_?', 33570: '_*', 33575: '_,', 33580: '_.', 33585: '_;', 33590: '_:', 33595: '_-',
    33600: '__', 33605: '_<', 33610: '_>', 33615: '<0', 33620: '<A', 33625: '<B', 33630: '<C', 33635: '<D', 33640: '<E', 33645: '<F',
    33650: '<G', 33655: '<H', 33660: '<I', 33665: '<J', 33670: '<K', 33675: '<L', 33680: '<M', 33685: '<N', 33690: '<O', 33695: '<P',
    33700: '<Q', 33705: '<R', 33710: '<S', 33715: '<T', 33720: '<U', 33725: '<V', 33730: '<W', 33735: '<X', 33740: '<Y', 33745: '<Z',
    33750: '<a', 33755: '<b', 33760: '<c', 33765: '<d', 33770: '<e', 33775: '<f', 33780: '<g', 33785: '<h', 33790: '<i', 33795: '<j',
    33800: '<k', 33805: '<l', 33810: '<m', 33815: '<n', 33820: '<o', 33825: '<p', 33830: '<q', 33835: '<r', 33840: '<s', 33845: '<t',
    33850: '<u', 33855: '<v', 33860: '<w', 33865: '<x', 33870: '<y', 33875: '<z', 33880: '<1', 33885: '<2', 33890: '<3', 33895: '<4',
    33900: '<5', 33905: '<6', 33910: '<7', 33915: '<8', 33920: '<9', 33925: '<+', 33930: '</', 33935: '<!', 33940: '<@', 33945: '<#',
    33950: '<$', 33955: '<%', 33960: '<&', 33965: '<(', 33970: '<)', 33975: '<=', 33980: '<?', 33985: '<*', 33990: '<,', 33995: '<.',
    34000: '<;', 34005: '<:', 34010: '<-', 34015: '<_', 34020: '<<', 34025: '<>', 34030: '>0', 34035: '>A', 34040: '>B', 34045: '>C',
    34050: '>D', 34055: '>E', 34060: '>F', 34065: '>G', 34070: '>H', 34075: '>I', 34080: '>J', 34085: '>K', 34090: '>L', 34095: '>M',
    34100: '>N', 34105: '>O', 34110: '>P', 34115: '>Q', 34120: '>R', 34125: '>S', 34130: '>T', 34135: '>U', 34140: '>V', 34145: '>W',
    34150: '>X', 34155: '>Y', 34160: '>Z', 34165: '>a', 34170: '>b', 34175: '>c', 34180: '>d', 34185: '>e', 34190: '>f', 34195: '>g',
    34200: '>h', 34205: '>i', 34210: '>j', 34215: '>k', 34220: '>l', 34225: '>m', 34230: '>n', 34235: '>o', 34240: '>p', 34245: '>q',
    34250: '>r', 34255: '>s', 34260: '>t', 34265: '>u', 34270: '>v', 34275: '>w', 34280: '>x', 34285: '>y', 34290: '>z', 34295: '>1',
    34300: '>2', 34305: '>3', 34310: '>4', 34315: '>5', 34320: '>6', 34325: '>7', 34330: '>8', 34335: '>9', 34340: '>+', 34345: '>/',
    34350: '>!', 34355: '>@', 34360: '>#', 34365: '>$', 34370: '>%', 34375: '>&', 34380: '>(', 34385: '>)', 34390: '>=', 34395: '>?',
    34400: '>*', 34405: '>,', 34410: '>.', 34415: '>;', 34420: '>:', 34425: '>-', 34430: '>_', 34435: '><', 34440: '>>'
};
