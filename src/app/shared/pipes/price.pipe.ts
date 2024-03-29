import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { PricePipeService } from './price-pipe.service';

@Pipe({ name: 'price', pure: false })
export class PricePipe implements PipeTransform {
    separator = ',';

    constructor(private pricePipeService: PricePipeService) {}

    public static convertPrice(value: any): string {
        if (!value) return '-';

        return (
            '﷼' +
            value
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                .split('.')[0]
        );
    }

    transform(price: string | number): string {
        if (!price) return '-';

        let priceNumber;

        if (this.pricePipeService.downScaleOrder === 0) {
            // we needed to remove all the decimals once user select Rial with the scale of unit
            typeof price === 'string' ? (priceNumber = Number(price).toFixed()) : (priceNumber = price.toFixed());
        } else {
            typeof price === 'string' ? (priceNumber = Number(price)) : (priceNumber = price);
        }

        if (!priceNumber) return `${price}`;

        priceNumber = priceNumber / Math.pow(10, this.pricePipeService.downScaleOrder);
        return new DecimalPipe('en-US').transform(priceNumber, this.pricePipeService.decimalInfo);
    }
}
