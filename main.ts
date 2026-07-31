/*
Grove LCD 16x2 MakeCode extension for micro:Bit
*/

/**
 * Adds blocks for controlling every function of a Grove LCD 16x2
 */
//% block="Grove LCD 16x2"
namespace gtGroveLcd16x2 {
    // Constants - instruction set

    // Extension blocks

    //% blockId=grove_lcd_16x2_initialize
    //% block="initialize LCD module"
    export function initialize(): void { 

    }

    //% blockId=grove_lcd_16x2_clear
    //% block="clear screen"
    export function clear(): void {

    }

    //% blockId=grove_lcd_16x2_show_string
    //% block="show string $message"
    //% message.defl="Hello world!"
    export function showString(message: string): void {

    }

    //% blockId=grove_lcd_16x2_show_number
    //% block="show number $value"
    export function showNumber(value: number): void {

    }

    //% blockId=grove_lcd_16x2_move_cursor
    //% block="move cursor to row: $row  column: $column"
    //% row.min=0 row.max=1 row.defl=0 row.shadow=range
    //% column.min = 0 column.max=15 column.defl=0 column.shadow=range
    export function moveCursor(row: number, column: number): void {

    }


    // Helper functions for sending commands, splitting bytes, etc

}

