#include "image.hpp"
#include "limits.h"
#include "utils.hpp"

#define MAX_PATH 200

#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.hpp"

Image::Image(string path){
    this->pixel = stbi_load(path.c_str(), &(this->width), &(this->height), &(this->channel), 3);
}

Image::~Image(){
    stbi_image_free(this->pixel);
}

int Image::getGrayscale(int x, int y){
    RGB p = this->getRGB(x, y);
    int result = (0.29 * ((double) p.red)) + (0.587 * ((double) p.green)) + (0.114 * ((double) p.blue));
    clampNumber(result, 0, 255);
    return result;
}

RGB Image::getRGB(int x, int y){
    if(x < 0) x = 0;
    if(y < 0) y = 0;
    if(x > this->width) x = this->width - 1;
    if(y > this->height) y = this->height - 1;

    int pos = (y * this->height + x) * this->channel;
    return (RGB){this->pixel[pos], this->pixel[pos + 1], this->pixel[pos + 2]};
}

HSV Image::getHSV(int x, int y){
    return Image::RGBtoHSV(Image::getRGB(x, y));
}

HSV Image::RGBtoHSV(RGB value){
    double r = ((double) value.red) / 255.0f;
    double g = ((double) value.green) / 255.0f;
    double b = ((double) value.blue) / 255.0f;

    double cmax = fmax(fmax(r, g), b);
    double cmin = fmin(fmin(r, g), b);
    double delta = cmax - cmin;

    double h;
    if(delta == 0) h = 0;
    else if(cmax == r) h = fmod(60 * ((g - b) / delta) + 360, 360);
    else if(cmax == g) h = fmod(60 * ((b - r) / delta) + 120, 360);
    else if(cmax == b) h = fmod(60 * ((r - g) / delta) + 240, 360);

    double s;
    if(cmax == 0) s = 0;
    else if(cmax != 0) s = delta / cmax;

    double v = cmax;

    return (HSV){h, s, v};
}

ImageBlocks::ImageBlocks(Image* img, int blockRow, int blockCol){
    this->image = img;
    this->blockRow = blockRow;
    this->blockCol = blockCol;

    this->blocks = (Block**) calloc(blockRow * blockCol, sizeof(Block*));

    int colStep = this->image->width / blockCol;
    int rowStep = this->image->height / blockRow;

    for(int i = 0; i < blockRow; ++i){
        for(int j = 0; j < blockCol; ++j){
            int idx = i * blockRow + blockCol;

            int startW = i * colStep;
            int endW = (i + 1) * colStep - 1;
            int startH = j * rowStep;
            int endH = (j + 1) * rowStep - 1;

            if(i == blockRow - 1) endW = this->image->width - 1;
            if(j == blockCol - 1) endH = this->image->height - 1;

            this->blocks[idx] = new Block(img, startW, endW, startH, endH);
        }
    }
}

ImageBlocks::~ImageBlocks(){
    int len = this->blockCol * this->blockRow;
    for(int i = 0; i < len; ++i){
        Block* b = this->blocks[i];
        if(!b) delete b;
    };
    free(this->blocks);
}

Block* ImageBlocks::getBlock(int row, int col){
    return this->blocks[row * this->blockRow + col];
}

Block::Block(Image* img, int startW, int endW, int startH, int endH){
    this->image = img;
    this->x = startW;
    this->y = startH;
    this->width = endW - startW + 1;
    this->height = endH - startH + 1;
}


RGB Block::getRGB(int x, int y){
    return this->image->getRGB(this->x + x, this->y + y);
}