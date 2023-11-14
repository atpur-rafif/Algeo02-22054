#ifndef _IMAGE_
#define _IMAGE_

#include <string>
using namespace std;

typedef struct {
    unsigned char red;
    unsigned char green;
    unsigned char blue;
} RGB;

typedef struct {
    double h;
    double s;
    double v;
} HSV;

class Image{
public:
    unsigned char *pixel;
    int width;
    int height;
    int channel;
    RGB getRGB(int x, int y);
    HSV getHSV(int x, int y);
    int getGrayscale(int x, int y);
    static HSV RGBtoHSV(RGB value);

    Image(string path);
    ~Image();
};

class Block{
public:
    Block(Image* img, int startW, int endW, int startH, int endH);
    RGB getRGB(int x, int y);
    Image* image;
    int width;
    int height;

private:
    int x;
    int y;
};

class ImageBlocks{
public:
    ImageBlocks(Image* img, int blockRow, int blockCol);
    ~ImageBlocks();

    Image* image;
    int blockRow;
    int blockCol;
    Block** blocks;
    Block* getBlock(int row, int col);
};

#endif