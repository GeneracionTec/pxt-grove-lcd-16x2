/*
Grove LCD 16x2 MakeCode extension for micro:Bit
*/

enum ShiftElement {
    display = 1,
    cursor = 0
}

/**
 * Adds blocks for controlling every function of a Grove LCD 16x2
 */
//% color=#0132c8 block="Grove LCD 16x2"
//% groups=['Basic blocks', 'Advanced functionality', 'others']
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
        for (let i = 0; i < message.length; i++) {
            sendData(message.charCodeAt(i));
        }
    }

    //% blockId=grove_lcd_16x2_show_number
    //% block="show number $value"
    //% group="Basic blocks"
    //% weight=70
    //% blockGap=4
    export function showNumber(value: number): void {
        let message = value.toString();
        showString(message);
    }

    //% blockId=grove_lcd_16x2_move_cursor
    //% block="move cursor to row: $row  column: $column"
    //% row.min=0 row.max=1 row.defl=0
    //% column.min=0 column.max=15 column.defl=0
    //% group="Basic blocks"
    //% weight=60
    //% blockGap=4
    export function moveCursor(row: number, column: number): void {

    }

    //% blockId=grove_lcd_16x2_clear
    //% block="clear screen"
    //% group="Basic blocks"
    //% weight=50
    //% blockGap=4
    export function clear(): void {
        sendCommand(ClearDisplay);
        basic.pause(10);
    }

    //% blockId=grove_lcd_16x2_return_home
    //% block="return cursor to home"
    //% group="Basic blocks"
    //% weight=40
    //% blockGap=8
    export function home(): void {
        sendCommand(ReturnHome);
        basic.pause(10);
    }

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
    export function cursorDisplayShift(element: ShiftElement, dir: Direction): void {
        shiftControlValues = dir == Direction.Right ? shiftControlValues | ShiftDirectionRL : shiftControlValues & ~ShiftDirectionRL;
        shiftControlValues = element == ShiftElement.display? shiftControlValues | ShiftDisplayCursor : shiftControlValues & ~ShiftDisplayCursor;
        callShiftControl();
    }

    // Function Set functions
    // Control interface data length (4/8 bit - not implemented), number of display lines (1/2), font type (5x11/5x8)

    // Helper functions for sending data, commands, etc
    
    // Set CGRAM Address - used for sending data
    function sendData (data: number): void {
        let buffer = pins.createBuffer(2);
        buffer[0] = SetCGRAMAddress;
        buffer[1] = data;

        pins.i2cWriteBuffer(lcdI2cAddress, buffer, false);
    }

    // Set DDRAM Address - used for sending commands
    function sendCommand (data: number) : void {
        let buffer = pins.createBuffer(2);
        buffer[0] = SetDDRAMAddress;
        buffer[1] = data;

        pins.i2cWriteBuffer(lcdI2cAddress, buffer, false);
    }

    function callEntryModeSet (): void {
        sendCommand(EntryModeSet | entryModeSetValues);
        basic.pause(10);
    }

    function callDisplayControl (): void {
        sendCommand(DisplayControl | displayControlValues);
        basic.pause(10);
    }

    function callShiftControl (): void {
        sendCommand(ShiftControl | shiftControlValues);
        basic.pause(10);
    }

    function callFunctionSet (): void {
        sendCommand(FunctionSet | functionSetValues);
        basic.pause(10);
    }

    // Testing area

    /**
    */
    //& blockId="set_slot"
    //% block="Create character in slot $slot| $pattern"
    //% pattern.shadow="create_character"
    //% inlineInputMode=external
    export function foo(slot: number, pattern: Image): void {
        console.log("Desde la función:");

        for (let y=0; y<8; y++) {
            let r= "";
            for (let x=0; x<5; x++) {
                if (pattern.pixel(x,y)) {
                    r += "1";
                }
                else {
                    r += "0";
                }
            }
            console.log(r);
        } 
        
    }

    /**
    */
    //% blockId="create_character"
    //% block="character data"
    //% imageLiteral=1
    //% imageLiteralColumns=5
    //% imageLiteralRows=8
    //% shim=images::createImage
    export function bar(img: string): Image {
        return <Image><any>img;
    }

}



