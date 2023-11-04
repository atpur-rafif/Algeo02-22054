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
        unsigned char* pixel;
        int width;
        int height;
        int channel;
        RGB getRGB(int x, int y);
        HSV getHSV(int x, int y);
        static HSV RGBtoHSV(RGB value);

        Image(string path);
        ~Image();
};

#endif