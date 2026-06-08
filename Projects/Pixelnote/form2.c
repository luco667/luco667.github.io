#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

#define W 640
#define H 480
#define MAX_PIXELS 50000
#define TOOLBAR 41

typedef enum { SQUARE, CIRCLE, TRIANGLE } ShapeType;

typedef struct {
    float x,y,w,h;
    SDL_Color c;
    ShapeType s;
} Pixel;

typedef struct {
    TTF_Font *main;
    TTF_Font *small;
} Fonts;

/* ---------------- UTILS ---------------- */

int clamp(int v,int a,int b){ return v<a?a:(v>b?b:v); }

/* ---------------- TEXT CACHE ---------------- */

typedef struct {
    char key[64];
    SDL_Texture *tex;
    float w,h;
} TextCache;

#define MAX_TEXT 64
TextCache cache[MAX_TEXT];
int cacheCount = 0;

SDL_Texture* getText(SDL_Renderer *r, Fonts *f, const char *txt, int small, float *w, float *h){
    for(int i=0;i<cacheCount;i++){
        if(strcmp(cache[i].key, txt)==0){
            *w=cache[i].w; *h=cache[i].h;
            return cache[i].tex;
        }
    }

    TTF_Font *font = small ? f->small : f->main;

    SDL_Surface *s = TTF_RenderText_Blended(font, txt, strlen(txt), (SDL_Color){255,255,255,255});
    if(!s) return NULL;

    SDL_Texture *t = SDL_CreateTextureFromSurface(r,s);
    SDL_DestroySurface(s);
    if(!t) return NULL;

    float tw,th;
    SDL_GetTextureSize(t,&tw,&th);

    if(cacheCount < MAX_TEXT){
        strcpy(cache[cacheCount].key, txt);
        cache[cacheCount].tex = t;
        cache[cacheCount].w = tw;
        cache[cacheCount].h = th;
        cacheCount++;
    }

    *w=tw; *h=th;
    return t;
}

/* ---------------- DRAW PIXEL ---------------- */

void drawPixel(SDL_Renderer *r, Pixel p){
    SDL_SetRenderDrawColor(r,p.c.r,p.c.g,p.c.b,p.c.a);

    if(p.s==SQUARE){
        SDL_FRect rr={p.x,p.y,p.w,p.h};
        SDL_RenderFillRect(r,&rr);
    }
    else if(p.s==CIRCLE){
        int cx=p.x+p.w/2, cy=p.y+p.h/2;
        int rad=p.w/2;
        for(int y=-rad;y<=rad;y++){
            int dx=sqrtf(rad*rad - y*y);
            SDL_RenderLine(r,cx-dx,cy+y,cx+dx,cy+y);
        }
    }
}

/* ---------------- MAIN ---------------- */

int main(){
    SDL_Init(SDL_INIT_VIDEO);
    TTF_Init();

    SDL_Window *win = SDL_CreateWindow("SDL3 SAFE", W,H,0);
    SDL_Renderer *ren = SDL_CreateRenderer(win,NULL);

    Fonts fonts;
    fonts.main = TTF_OpenFont("Minecraft.ttf",24);
    fonts.small = TTF_OpenFont("Minecraft.ttf",14);

    if(!fonts.main || !fonts.small){
        printf("Font error\n");
        return 1;
    }

    Pixel pixels[MAX_PIXELS];
    int count=0;

    SDL_Color current={255,0,0,255};
    ShapeType shape=SQUARE;

    bool run=1, down=0;
    float lx=-1,ly=-1;

    while(run){
        SDL_Event e;
        while(SDL_PollEvent(&e)){
            if(e.type==SDL_EVENT_QUIT) run=0;
            if(e.type==SDL_EVENT_MOUSE_BUTTON_DOWN) down=1;
            if(e.type==SDL_EVENT_MOUSE_BUTTON_UP){
                down=0;
                lx=ly=-1;
            }
        }

        float mx,my;
        SDL_GetMouseState(&mx,&my);

        if(down && my>TOOLBAR && count<MAX_PIXELS){
            if(lx>=0){
                float dx=mx-lx,dy=my-ly;
                int steps=sqrtf(dx*dx+dy*dy);
                if(!steps) steps=1;

                for(int i=0;i<=steps && count<MAX_PIXELS;i++){
                    float x=lx+dx*i/steps;
                    float y=ly+dy*i/steps;

                    pixels[count]=(Pixel){
                        x-2,y-2,5,5,
                        current,
                        shape
                    };
                    count++;
                }
            }
            lx=mx; ly=my;
        }

        SDL_SetRenderDrawColor(ren,0,0,0,255);
        SDL_RenderClear(ren);

        for(int i=0;i<count;i++)
            drawPixel(ren,pixels[i]);

        /* toolbar */
        SDL_SetRenderDrawColor(ren,60,60,60,255);
        SDL_FRect tb={0,0,W,TOOLBAR};
        SDL_RenderFillRect(ren,&tb);

        float tw,th;
        SDL_Texture *t = getText(ren,&fonts,"DRAW",0,&tw,&th);
        if(t){
            SDL_FRect dst={10,5,tw,th};
            SDL_RenderTexture(ren,t,NULL,&dst);
        }

        SDL_RenderPresent(ren);
    }

    TTF_CloseFont(fonts.main);
    TTF_CloseFont(fonts.small);

    SDL_DestroyRenderer(ren);
    SDL_DestroyWindow(win);

    TTF_Quit();
    SDL_Quit();
}