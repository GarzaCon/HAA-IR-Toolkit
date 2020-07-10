// HAA IR Toolkit - Copyright 2020 Antonio García (@GarzaCon)

$(document).ready(function () {

    /* BEGIN STANDARD PROTOCOL LOGIC */
    $("#protocol").on("change", function () {
        if (this.value === "daikin") {
            // set default values and show fields
            $("#prefixvalue").val("LREM");
            $("#bit0value").val("0*A7");
            $("#bit1value").val("0*DX");
            $("#bit2value").val("0*(=");
            $("#bit3value").val("LREM");
            $("#footervalue").val("0*");

            $(".hiddenProtocolField").show();
        } else if (this.value === "user") {
            // none, set default dummy values
            $("#prefixvalue").val("prefix");
            $("#bit0value").val("b0");
            $("#bit1value").val("b1");
            $("#longpausevalue").val("pause");
            $("#footervalue").val("footer");

            $(".hiddenProtocolField").show();
        } else {
            // none, just clean value and hide fields
            $("#prefixvalue").val("");
            $("#bit0value").val("");
            $("#bit1value").val("");
            $("#longpausevalue").val("");
            $("#footervalue").val("");

            $(".hiddenProtocolField").hide();
        }
    });

    $("#clearPackets").on("click", function () {
        $("#inputIR").val("");
        $("#inputIR").focus();
    });

    $("#clearAll").on("click", function () {
        $("#inputIR").val("");
        $("#protocolBits").val("");
        $("#standardBitsString").val("");
        $("#outputProtocolCommand").val("");
        $("#outputProtocol").val("");
        $("#rawProtocolOutput").val("");
        $("#inputIR").focus();
    });

    $("#clearRawStandard").on("click", function () {
        $("#rawProtocolOutput").val("");
    });
    /* END STANDARD PROTOCOL LOGIC */

    /* BEGIN PSEUDO PROTOCOL LOGIC */
    $("#preprocessor").on("click", function () {
        doPseudoRAWLogic();
    });

    $("#clearPacketsPseudo").on("click", function () {
        $("#inputIRPseudo").val("");
        $("#inputIRPseudo").focus();
    });

    $("#clearAllPseudo").on("click", function () {
        $("#inputIRPseudo").val("");
        $("#preprocessOutput").val("");
        $("#averages").val("");
        $("#preprocessedPackets").val("");
        $("#rawPseudoProtocolOutput").val("");
        $("#inputIRPseudo").focus();
    });

    $("#rounding").on("change", function () {
        doPseudoRAWLogic();
    });

    $("#clearRawPseudo").on("click", function () {
        $("#rawPseudoProtocolOutput").val("");
    });
    /* END PSEUDO PROTOCOL LOGIC */

    /* BEGIN PRONTO PROTOCOL LOGIC */
    $("#decodePronto").on("click", function () {
        doProntoLogic();
    });

    $("#clearPacketsPronto").on("click", function () {
        $("#inputIRPronto").val("");
        $("#inputIRPronto").focus();
    });

    $("#clearAllPronto").on("click", function () {
        $("#inputIRPronto").val("");
        $("#preprocessOutputPronto").val("");
        $("#resultBitsPronto").val("");
        $("#resultProtocolPronto").val("");
        $("#inputIRPseudo").focus();
    });

    $("#clearRawPseudo").on("click", function () {
        $("#inputIRPronto").val("");
        $("#preprocessOutputPronto").val("");
        $("#resultBitsPronto").val("");
        $("#resultProtocolPronto").val("");
        $("#inputIRPseudo").focus();
    });

    $("#clearRawPronto").on("click", function () {
        $("#resultProtocolPronto").val("");
    });
    /* END PRONTO PROTOCOL LOGIC */
});




