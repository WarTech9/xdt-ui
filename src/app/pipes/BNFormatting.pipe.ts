import { Pipe, PipeTransform } from '@angular/core';
import { BigNumber, ethers } from 'ethers';

@Pipe({
    name: 'formatBN'
})

export class BNFormattingPipe implements PipeTransform {

    transform(value: BigNumber, args: string[]): string {
        return this.formatted(value, args[0])
    }

    formatted(price: BigNumber, decimals: string) {
        if (price) {
            return ethers.utils.formatUnits(price, decimals)
        } else {
            return '-'
        }
    }
}