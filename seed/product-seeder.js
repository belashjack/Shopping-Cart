var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shopping');

// create new product
var products = [
    new Product({
        imagePath: '/images/1.jpg',
        title: 'CR7 Mercurial Campeões',
        description: 'The CR7 Mercurial Campeões comes in Portugal’s national colors of red and green with an added golden touch. The boots have a tonal red stripe detail on the Flyknit material, with a golden Nike swoosh on the outside of the boot.',
        price: 10,
    }),
    new Product({
        imagePath: '/images/3.jpg',
        title: 'Adidas X And Messi 16 | The Breakdown',
        description: 'The SprintFrame soleplate replaces the Gambetrax system from the Messi 15.1 to bring the Messi in line with both the X and the Ace. The upper is the party piece for me however, which is dubbed Agilityknit and is a knitted synthetic which has a honeycombesque design pattern to it.',
        price: 20,
    }),
    new Product({
        imagePath: '/images/1.jpg',
        title: 'Nike Tech Craft Collection',
        description: 'With Tech Craft collection, you’ll benefit from the premium Alegria leather on the boots’ upper, updated with a subtle and intricate embossing pattern for an even softer feel and responsive touch. Nike’s All Conditions Control (ACC) technology is applied to enhance ball control in both dry and wet conditions.',
        price: 30,
    }),
    new Product({
        imagePath: '/images/6.jpg',
        title: 'Umbro Veloce Afriq Football',
        description: 'PU upper with leather look, fixed EVA insock for comfort, build on a wider fitting last giving great all around volume and comfort.',
        price: 40,
    }),
    new Product({
        imagePath: '/images/5.jpg',
        title: 'Adidas X 16.4 FXG',
        description: 'Synthetic sole, shaft measures approximately Low-Top, lightweight and a locked-in fit',
        price: 15,
    }),
    new Product({
        imagePath: '/images/4.jpg',
        title: 'Nike Hypervenom WR10',
        description: 'Launched to commemorate Wayne Rooney’s landmark 250th goal for Manchester United, the special edition Nike Hypervenom Phinish features a Red Devils inspired colourway while WR10 is printed on the lateral heel. With over 500 appearances for one of England’s greatest clubs, he has won every major honour at club level and now holds goalscoring records for both club and country.',
        price: 50,
    }),
];

// сохраняем в базу данных
var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save((err, result) => {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}