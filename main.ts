/*
Grove LCD 16x2 MakeCode extension for micro:Bit
*/

enum GTecGroveLcd16x2ShiftElement {
    display = 1,
    cursor = 0
}

/**
 * Adds blocks for controlling every function of a Grove LCD 16x2
 */
//% color=#0132c8 icon="\uf0ad" block="Grove LCD 16x2"
//% groups=['Basic blocks', 'Custom characters', 'Advanced functionality', 'others']
//% weight=55
namespace gTecGroveLcd16x2 {
    // Constants - instruction set
    const ClearDisplay          = 0x01; // Command
    const ReturnHome            = 0x02; // Command

    const EntryModeSet          = 0x04; // Command - Use with following data
    const EntryModeShift        = 0x01; // 0x01=Shift entire display - 0x00=No shift
    const EntryModeIncrement    = 0x02; // 0x02=Increment cursor direction - 0x00=Decrement

    const DisplayControl        = 0x08; // Command - Use with following data
    const CursorBlinkingOn      = 0x01; // 0x01=Cursor blink on - 0x00=Cursor blink off
    const CursorOn              = 0x02; // 0x02=Cursor on - 0x00=Cursor off
    const DisplayOn             = 0x04; // 0x04=Display on - 0x00=Display off

    const ShiftControl          = 0x10; // Command - Use with following data
    const ShiftDirectionRL      = 0x04; // 0x04=Shift right - 0x00=Shift left
    const ShiftDisplayCursor    = 0x08; // 0x08=Shift display - 0x00=Shift cursor

    const FunctionSet           = 0x20; // Command - Use with following data
    const FontStyle5x11         = 0x04; // 0x04=5x11 - 0x00=5x7
    const Display2Rows          = 0x08; // 0x08=2 rows - 0x00=1 rows
    const DataLength8Bits       = 0x10; // 0x10=8 bits - 0x00=4 bits

    const SetCGRAMAddress       = 0x40;
    const SetDDRAMAddress       = 0x80;

    // Initial values
    let lcdI2cAddress           = 0x3e;

    let entryModeSetValues      = EntryModeIncrement & ~EntryModeShift;
    let displayControlValues    = DisplayOn & ~CursorOn & ~CursorBlinkingOn;
    let shiftControlValues      = ~ShiftDisplayCursor & ShiftDirectionRL;
    let functionSetValues       = DataLength8Bits | Display2Rows | FontStyle5x11;

    // Extension blocks
    // Basic blocks

    //% blockId=grove_lcd_16x2_initialize
    //% block="initialize LCD module"
    //% group="Basic blocks"
    //% weight=90
    //% blockGap=4
    export function initialize(): void {
        basic.pause(20);
        callFunctionSet();
        callDisplayControl();
        clear();
        callEntryModeSet();
    }

    //% blockId=grove_lcd_16x2_show_string
    //% block="show string $message"
    //% message.defl="Hello world!"
    //% group="Basic blocks"
    //% weight=80
    //% blockGap=4
    export function showString(message: string): void {
        if (message.includes("\\[")) {
            message = parseForEscapedText(message);
        }
        
        for (let i = 0; i < message.length; i++) {
            sendData(message.charCodeAt(i));
            basic.pause(1);
        }
    }

    //% blockId=grove_lcd_16x2_show_number
    //% block="show number $value"
    //% group="Basic blocks"
    //% weight=70
    //% blockGap=4
    export function showNumber(value: number): void {
        let message = value.toString();

        for (let i = 0; i < message.length; i++) {
            sendData(message.charCodeAt(i));
            basic.pause(1);
        }
    }

    //% blockId=grove_lcd_16x2_move_cursor
    //% block="move cursor to column: $column row: $row"
    //% column.min=0 column.max=15 column.defl=0
    //% row.min=0 row.max=1 row.defl=0
    //% group="Basic blocks"
    //% weight=60
    //% blockGap=4
    export function moveCursor(column: number, row: number): void {
        let data = 0x00 | column;

        if (row > 0) {
            data = 0x40 | column;
        }

        sendCommand(SetDDRAMAddress | data);
        basic.pause(1);
    }

    //% blockId=grove_lcd_16x2_clear
    //% block="clear screen"
    //% group="Basic blocks"
    //% weight=50
    //% blockGap=4
    export function clear(): void {
        sendCommand(ClearDisplay);
        basic.pause(2);
    }

    //% blockId=grove_lcd_16x2_return_home
    //% block="return cursor to home"
    //% group="Basic blocks"
    //% weight=40
    //% blockGap=4
    export function home(): void {
        sendCommand(ReturnHome);
        basic.pause(2);
    }

    // Custom character blocks

    //% blockId=grove_lcd_16x2_show_cgram_character
    //% block="show character $slot"
    //% group="Custom characters"
    //% slot.min=0 slot.max=255 slot.defl=0
    //% weight=90
    //% blockGap=16
    export function showCGRAMCharacter(slot: number): void {
        sendData(slot);
        basic.pause(1);
    }

    //% blockId=grove_lcd_16x2_show_cgram_character_inline
    //% block="char $slot"
    //% group="Custom characters"
    //% slot.min=0 slot.max=255 slot.defl=0
    //% weight=85
    //% blockGap=16
    export function showCGRAMCharacterInline(slot: number): string {
        return String.fromCharCode(slot);
    }

    /**
    */
    //& blockId="grove_lcd_16x2_save_character_to_cgram"
    //% block="Save character to memory slot $slot| $pattern"
    //% slot.min=0 slot.max=7 slot.defl=0
    //% pattern.shadow="grove_lcd_16x2_5x8_matrix"
    //% inlineInputMode=external
    //% group="Custom characters"
    //% weight=80
    //% blockGap=16
    export function saveCharacterToCGRAM(slot: number, pattern: Image): void {
        let charBytes: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

        // Build the bytes for each row, based on pixels being on or off
        for (let y = 0; y < 8; y++) {
            let byte = 0;
            for (let x = 0; x < 5; x++) {
                byte = (byte << 1) | (pattern.pixel(x, y) ? 1 : 0);
            }
            charBytes[y] = byte;
        }

        // Send command and data bytes for saving the custom character on the appropriate slot
        sendCommand(SetCGRAMAddress | (slot << 3));
        basic.pause(1);

        for (let i = 0; i < 8; i++) {
            sendData(charBytes[i]);
            basic.pause(2);
        }

        // Send a "Home" command to get out of CGRAM address context and back to DDRAM with a known address
        home();
    }

    /**
    */
    //% blockId="grove_lcd_16x2_5x8_matrix"
    //% block="character data"
    //% imageLiteral=1
    //% imageLiteralColumns=5
    //% imageLiteralRows=8
    //% shim=images::createImage
    //% group="Custom characters"
    //% weight=70
    //% blockGap=16
    export function characterMatrix(img: string): Image {
        return <Image><any>img;
    }

    // Advanced functionality blocks

    // Entry Mode Set functions
    // Control cursor direction (increment/decrement), shift of entire display

    //% blockId=grove_lcd_16x2_entrymode_cursor_direction
    //% block="cursor direction $dir"
    //% group="Advanced functionality"
    //% weight=90
    //% blockGap=4
    export function cursorDirection(dir: Direction): void {
        entryModeSetValues = dir == Direction.Right ? entryModeSetValues | EntryModeIncrement : entryModeSetValues & ~EntryModeIncrement;
        callEntryModeSet();
    }

    //% blockId=grove_lcd_16x2_entrymode_shift_on_off
    //% block="turn display shifting $state"
    //% state.shadow="toggleOnOff"
    //% group="Advanced functionality"
    //% weight=80
    //% blockGap=4
    export function displayShiftOnOff(state: boolean): void {
        entryModeSetValues = state ? entryModeSetValues | EntryModeShift : entryModeSetValues & ~EntryModeShift;
        callEntryModeSet();
    }

    // Display Control functions
    // Control display on/off, cursor on/off, cursor blinking on/off

    //% blockId=grove_lcd_16x2_display_on_off
    //% block="turn display $state"
    //% state.shadow="toggleOnOff"
    //% group="Advanced functionality"
    //% weight=70
    //% blockGap=4
    export function displayOnOff(state: boolean): void {
        displayControlValues = state ? displayControlValues | DisplayOn : displayControlValues & ~DisplayOn;
        callDisplayControl();
    }

    //% blockId=grove_lcd_16x2_cursor_on_off
    //% block="turn cursor $state"
    //% state.shadow="toggleOnOff"
    //% group="Advanced functionality"
    //% weight=60
    //% blockGap=4
    export function cursorOnOff(state: boolean): void {
        displayControlValues = state ? displayControlValues | CursorOn : displayControlValues & ~CursorOn;
        callDisplayControl();
    }

    //% blockId=grove_lcd_16x2_cursor_blinking_on_off
    //% block="turn cursor blinking $state"
    //% state.shadow="toggleOnOff"
    //% group="Advanced functionality"
    //% weight=50
    //% blockGap=4
    export function cursorBlinkingOnOff(state: boolean): void {
        displayControlValues = state ? displayControlValues | CursorBlinkingOn : displayControlValues & ~CursorBlinkingOn;
        callDisplayControl();
    }

    // Cursor or Display shift functions
    // Control cursor or display shift, shift direction

    //% blockId=grove_lcd_16x2_cursor_display_shift
    //% block="shift $element to the $dir"
    //% group="Advanced functionality"
    //% weight=40
    //% blockGap=4
    export function cursorDisplayShift(element: GTecGroveLcd16x2ShiftElement, dir: Direction): void {
        shiftControlValues = dir == Direction.Right ? shiftControlValues | ShiftDirectionRL : shiftControlValues & ~ShiftDirectionRL;
        shiftControlValues = element == GTecGroveLcd16x2ShiftElement.display? shiftControlValues | ShiftDisplayCursor : shiftControlValues & ~ShiftDisplayCursor;
        callShiftControl();
    }

    // Function Set functions
    // Control interface data length (4/8 bit - not implemented), number of display lines (1/2), font type (5x11/5x8)



    // Helper functions for sending data, commands, etc
    
    // Functions for configuring LCD features
    function callEntryModeSet (): void {
        sendCommand(EntryModeSet | entryModeSetValues);
        basic.pause(1);
    }

    function callDisplayControl (): void {
        sendCommand(DisplayControl | displayControlValues);
        basic.pause(1);
    }

    function callShiftControl (): void {
        sendCommand(ShiftControl | shiftControlValues);
        basic.pause(1);
    }

    function callFunctionSet (): void {
        sendCommand(FunctionSet | functionSetValues);
        basic.pause(1);
    }

    // Send a data byte
    function sendData(data: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x40;
        buffer[1] = data;

        pins.i2cWriteBuffer(lcdI2cAddress, buffer, false);
    }

    // Send a command byte
    function sendCommand(data: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = 0x80;
        buffer[1] = data;

        pins.i2cWriteBuffer(lcdI2cAddress, buffer, false);
    }
 
    // String parsing function. Parses a string and replaces escape sequences
    // (for example \[15] or \[0x3F]) with their corresponding character codes (0-255).
    function parseForEscapedText(text: string): string {
        let result = "";
        let i = 0;

        while (i < text.length) {
            // Check if there is enough text left for the escape sequence to be complete
            // Then look for the start pattern: \[
            if (i + 3 < text.length && text.substr(i,2) == "\\[") {
                let stringInBrackets = "";
                let lookAheadPointer = i + 2;
                let foundClosingBracket = false;

                // Gather all characters inside the brackets
                while (lookAheadPointer < text.length) {
                    if (text.charAt(lookAheadPointer) == "]") {
                        foundClosingBracket = true;
                        break;
                    }
                    stringInBrackets += text.charAt(lookAheadPointer);
                    lookAheadPointer++;
                }

                // Process the gathered content if brackets closed successfully
                if (foundClosingBracket && stringInBrackets.length > 0) {
                    let finalCode = -1;

                    // Detect if it is a Hexadecimal sequence
                    if (stringInBrackets.length >= 3 && stringInBrackets.substr(0,2).toLowerCase() == "0x") {
                        let hexPart = stringInBrackets.substr(2);

                        // Simple hex validation (allow only 0-9, a-f, A-F)
                        let isHex = true;
                        for (let h = 0; h < hexPart.length; h++) {
                            if (!"0123456789abcdef".includes(hexPart.charAt(h).toLowerCase())) {
                                isHex = false;
                                break;
                            }
                        }
                        if (isHex && hexPart.length > 0) {
                            finalCode = parseInt(hexPart, 16);
                        }
                    }
                    // Process as standard Decimal sequence
                    else {
                        let isDecimal = true;
                        for (let d = 0; d < stringInBrackets.length; d++) {
                            if (!"0123456789".includes(stringInBrackets.charAt(d))) {
                                isDecimal = false;
                                break;
                            }
                        }
                        if (isDecimal) {
                            finalCode = parseInt(stringInBrackets, 10);
                        }
                    }

                    // If a valid number between 0-255 was parsed, insert character
                    if (finalCode >= 0 && finalCode <= 255) {
                        result += String.fromCharCode(finalCode);
                        i = lookAheadPointer + 1; // Advance main pointer past ']'
                        continue;
                    }
                }
            }

            // Fallback: keep current character if no valid pattern matched
            result += text.charAt(i);
            i++;
        }
        return result;
    }

    // Testing area
}
