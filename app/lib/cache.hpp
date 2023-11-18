#ifndef _CACHE_
#define _CACHE_

#include <string>
#include "vector.hpp"
using namespace std;

void cacheSetup(string path, string type);
void addCache(string filename, Vectors* vs);
Vectors *getCache(string filename);
void cacheCleanup();

#endif