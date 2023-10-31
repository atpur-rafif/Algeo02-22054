CC = g++
CFLAGS = -std=c++17

MAIN = $(SRC)/main

SRC = app
OUT = dist/bin
OBJ = $(OUT)/o


$(OBJ)/%.o: $(SRC)/%.cpp
	mkdir -p $(@D)
	$(CC) $(CFLAGS) -c -o $@ $^

build: $(OBJ)/main.o
	mkdir -p $(@D)
	$(CC) $(CFLAGS) -o $(OUT)/main $^

all: build
	$(OUT)/main