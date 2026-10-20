#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <math.h>

#define WINDOW_WIDTH 640
#define WINDOW_HEIGHT 480
#define MAX_PIXELS 50000
#define TOOLBAR_HEIGHT 41

typedef enum { SHAPE_SQUARE, SHAPE_CIRCLE, SHAPE_TRIANGLE } ShapeType;
typedef struct { SDL_FRect rect; const char *label; } Button;
typedef struct { float x, y, w, h; SDL_Color color; ShapeType shape; } Pixel;

int clamp(int val,int min,int max){ return val<min?min:(val>max?max:val); }

void renderButton(SDL_Renderer *renderer, TTF_Font *font, Button btn, int fontSize){
    SDL_SetRenderDrawColor(renderer,200,200,200,255);
    SDL_RenderFillRect(renderer,&btn.rect);
    if(font){
        TTF_Font *tmpFont=font;
        if(fontSize) tmpFont=TTF_OpenFont("Minecraft.ttf",fontSize);
        SDL_Surface *surf=TTF_RenderText_Blended(tmpFont,btn.label,strlen(btn.label),(SDL_Color){0,0,0,255});
        SDL_Texture *tex=SDL_CreateTextureFromSurface(renderer,surf); SDL_DestroySurface(surf);
        float tw=0,th=0; SDL_GetTextureSize(tex,&tw,&th);
        SDL_FRect dst={btn.rect.x+(btn.rect.w-tw)/2,btn.rect.y+(btn.rect.h-th)/2,tw,th};
        SDL_RenderTexture(renderer,tex,NULL,&dst); SDL_DestroyTexture(tex);
        if(fontSize) TTF_CloseFont(tmpFont);
    }
}

void renderFilledCircle(SDL_Renderer *renderer, float cx, float cy, float radius, SDL_Color c) {
    SDL_SetRenderDrawColor(renderer, c.r, c.g, c.b, c.a);
    int r = (int)radius;
    for (int y = -r; y <= r; y++) {
        int dx = (int)sqrtf(r*r - y*y);
        SDL_RenderLine(renderer, cx - dx, cy + y, cx + dx, cy + y);
    }
}

void renderPixel(SDL_Renderer *renderer, Pixel p){
    if(p.shape==SHAPE_SQUARE){
        SDL_SetRenderDrawColor(renderer,p.color.r,p.color.g,p.color.b,p.color.a);
        SDL_FRect r={p.x,p.y,p.w,p.h}; SDL_RenderFillRect(renderer,&r);
    } else if(p.shape==SHAPE_CIRCLE){
        renderFilledCircle(renderer,p.x+p.w/2,p.y+p.h/2,p.w/2,p.color);
    } else if(p.shape==SHAPE_TRIANGLE){
        SDL_Vertex v[3];
        float cx=p.x+p.w/2, cy=p.y+p.h/2;
        v[0].position=(SDL_FPoint){cx,cy-p.h/2};
        v[1].position=(SDL_FPoint){cx-p.w/2,cy+p.h/2};
        v[2].position=(SDL_FPoint){cx+p.w/2,cy+p.h/2};
        for(int i=0;i<3;i++){
            v[i].color=(SDL_FColor){p.color.r/255.0f,p.color.g/255.0f,p.color.b/255.0f,p.color.a/255.0f};
            v[i].tex_coord=(SDL_FPoint){0,0};
        }
        SDL_RenderGeometry(renderer,NULL,v,3,NULL,0);
    }
}

typedef struct {
    SDL_FRect rect;
    int *r,*g,*b;
    bool dragging;
} ColorPicker;

typedef struct {
    SDL_FRect rect;
    bool dragging;
} ShapePicker;
void renderColorPicker(SDL_Renderer *renderer, TTF_Font *font, ColorPicker *picker,
                       float mx, float my, bool mouseDown, SDL_Color *currentColor)
{
    SDL_SetRenderDrawColor(renderer, 60, 60, 60, 255);
    SDL_RenderFillRect(renderer, &picker->rect);

    // Drag bar
    SDL_FRect dragBar = {picker->rect.x, picker->rect.y, picker->rect.w, 30};
    SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
    SDL_RenderFillRect(renderer, &dragBar);

    static float offsetX=0, offsetY=0;
    if(mouseDown && mx >= dragBar.x && mx <= dragBar.x + dragBar.w &&
       my >= dragBar.y && my <= dragBar.y + dragBar.h) picker->dragging = true;
    if(!mouseDown) picker->dragging = false;

    if(picker->dragging){
        offsetX = mx - picker->rect.w/2;
        offsetY = my - 15;
        picker->rect.x = offsetX;
        picker->rect.y = offsetY;
    }

    // Carré de couleur (preview)
    SDL_FRect preview = {picker->rect.x + 20, picker->rect.y + 50, picker->rect.w - 40, 40};
    SDL_SetRenderDrawColor(renderer, *picker->r, *picker->g, *picker->b, 255);
    SDL_RenderFillRect(renderer, &preview);

    // Sliders R, G, B
    float sliderW = picker->rect.w - 40; 
    float sliderH = 12;
    float startX = picker->rect.x + 20;
    float startY = picker->rect.y + 100; 
    SDL_Color colors[3]={{255,0,0,255},{0,255,0,255},{0,0,255,255}};
    int *values[3]={picker->r,picker->g,picker->b};

    for(int i=0;i<3;i++){
        SDL_FRect bg = {startX, startY + i*25, sliderW, sliderH};
        SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
        SDL_RenderFillRect(renderer, &bg);

        SDL_FRect fill = {bg.x, bg.y, (*values[i]/255.0f)*sliderW, sliderH};
        SDL_SetRenderDrawColor(renderer, colors[i].r, colors[i].g, colors[i].b, 255);
        SDL_RenderFillRect(renderer, &fill);

        if(mouseDown && mx >= bg.x && mx <= bg.x+sliderW &&
           my >= bg.y && my <= bg.y+sliderH){
            *values[i] = clamp((int)((mx - bg.x)/sliderW*255), 0, 255);
        }

        currentColor->r = *picker->r;
        currentColor->g = *picker->g;
        currentColor->b = *picker->b;
    }

    // Texte RGB du picker
    char rgbText[32];
    snprintf(rgbText, sizeof(rgbText), "R:%d G:%d B:%d", *picker->r, *picker->g, *picker->b);
    TTF_Font *smallFont = TTF_OpenFont("Minecraft.ttf", 16);
    SDL_Surface *surf = TTF_RenderText_Blended(smallFont, rgbText, strlen(rgbText), (SDL_Color){255,255,255,255});
    SDL_Texture *tex = SDL_CreateTextureFromSurface(renderer, surf); SDL_DestroySurface(surf);
    float tw=0, th=0; SDL_GetTextureSize(tex, &tw, &th);
    SDL_FRect dst = {picker->rect.x + 10, picker->rect.y + picker->rect.h - th - 10, tw, th};
    SDL_RenderTexture(renderer, tex, NULL, &dst);
    SDL_DestroyTexture(tex);
    TTF_CloseFont(smallFont);
}


void renderShapePicker(SDL_Renderer *renderer, TTF_Font *font, ShapePicker *picker,
                       float mx, float my, bool mouseDown, ShapeType *currentShape)
{
    // Fond du picker
    SDL_SetRenderDrawColor(renderer,70,70,70,255);
    SDL_RenderFillRect(renderer,&picker->rect);

    // Drag bar (réduite à moitié en largeur et centrée)
    float dragBarW = picker->rect.w / 2;
    SDL_FRect dragBar = {picker->rect.x + (picker->rect.w - dragBarW)/2, picker->rect.y, dragBarW, 30};
    SDL_SetRenderDrawColor(renderer,200,200,200,255);
    SDL_RenderFillRect(renderer, &dragBar);

    static float offsetX=0, offsetY=0;
    if(mouseDown && mx>=dragBar.x && mx<=dragBar.x+dragBar.w && my>=dragBar.y && my<=dragBar.y+dragBar.h)
        picker->dragging = true;
    if(!mouseDown) picker->dragging = false;

    if(picker->dragging){
        offsetX = mx - picker->rect.w/2;
        offsetY = my - 15;
        picker->rect.x = offsetX;
        picker->rect.y = offsetY;
    }

    // Boutons de forme (décalés 10 px sous la drag bar)
    const char *shapes[]={"Square","Round","Triangle"};
    float tw=0, th=0;
    float btnYStart = picker->rect.y + dragBar.h + 10; // 10 px sous la drag bar
    for(int i=0;i<3;i++){
        SDL_FRect btn={picker->rect.x + 10, btnYStart + i*40, picker->rect.w - 20, 30};
        SDL_SetRenderDrawColor(renderer,200,200,200,255);
        SDL_RenderFillRect(renderer,&btn);
        SDL_Surface *s=TTF_RenderText_Blended(font,shapes[i],strlen(shapes[i]),(SDL_Color){0,0,0,255});
        SDL_Texture *t=SDL_CreateTextureFromSurface(renderer,s); SDL_DestroySurface(s);
        SDL_GetTextureSize(t,&tw,&th);
        SDL_FRect dst={btn.x+(btn.w-tw)/2, btn.y+(btn.h-th)/2, tw, th};
        SDL_RenderTexture(renderer,t,NULL,&dst);
        SDL_DestroyTexture(t);

        if(mouseDown && mx>=btn.x && mx<=btn.x+btn.w && my>=btn.y && my<=btn.y+btn.h){
            *currentShape = (ShapeType)i;
        }
    }
}


int main(){
    SDL_Init(SDL_INIT_VIDEO); TTF_Init();
    SDL_Window *window=SDL_CreateWindow("DRAW PIXELS",WINDOW_WIDTH,WINDOW_HEIGHT,0);
    SDL_Renderer *renderer=SDL_CreateRenderer(window,NULL);
    TTF_Font *font=TTF_OpenFont("Minecraft.ttf",24);

    Button colorButton={{0,0,40,40},"C"};
    Button increase={{41,0,40,40},"+"};
    Button decrease={{82,0,40,40},"-"}; 
    Button shapeBtn={{123,0,40,40},"S"}; 
    Button erase={{164,0,40,40},"E"};
    SDL_FRect colorPreview={WINDOW_WIDTH-50,0,40,40};

    int pixelWidth=5,pixelHeight=5;
    SDL_Color currentColor={255,0,0,255};
    Pixel pixels[MAX_PIXELS]; int pixelCount=0;
    ShapeType currentShape=SHAPE_SQUARE;

    bool running=true,mouseDown=false,mouseRight=false;
    bool showColorPicker=false,showShapePicker=false;
    SDL_Event e;
    int pickerR=currentColor.r,pickerG=currentColor.g,pickerB=currentColor.b;
    float lastX=-1,lastY=-1;
    Uint32 lastButtonTime=0;
    const Uint32 repeatDelay=50;

    ColorPicker picker={{100,100,300,200},&pickerR,&pickerG,&pickerB,false};
    ShapePicker shapePicker={{150,150,150,150}, false};
    bool clicked=false;

    while(running){
        while(SDL_PollEvent(&e)){
            if(e.type==SDL_EVENT_QUIT) running=false;
            if(e.type==SDL_EVENT_MOUSE_BUTTON_DOWN){
                if(e.button.button==SDL_BUTTON_LEFT){ mouseDown=true; clicked=false; }
                if(e.button.button==SDL_BUTTON_RIGHT) mouseRight=true;
            }
            if(e.type==SDL_EVENT_MOUSE_BUTTON_UP){
                if(e.button.button==SDL_BUTTON_LEFT) mouseDown=false;
                if(e.button.button==SDL_BUTTON_RIGHT) mouseRight=false;
                lastX=lastY=-1;
            }
        }

        float mx=0,my=0; SDL_GetMouseState(&mx,&my);
        Uint32 now=SDL_GetTicks();

        // Boutons
        if(mouseDown && !clicked){
            if(mx>=colorButton.rect.x && mx<=colorButton.rect.x+colorButton.rect.w &&
               my>=colorButton.rect.y && my<=colorButton.rect.y+colorButton.rect.h){
                showColorPicker=!showColorPicker; clicked=true;
            }
            if(mx>=shapeBtn.rect.x && mx<=shapeBtn.rect.x+shapeBtn.rect.w &&
               my>=shapeBtn.rect.y && my<=shapeBtn.rect.y+shapeBtn.rect.h){
                showShapePicker=!showShapePicker; clicked=true;
            }
            if(mx>=erase.rect.x && mx<=erase.rect.x+erase.rect.w &&
               my>=erase.rect.y && my<=erase.rect.y+erase.rect.h){pixelCount=0; clicked=true;}
            if(mx>=increase.rect.x && mx<=increase.rect.x+increase.rect.w &&
               my>=increase.rect.y && my<=increase.rect.y+increase.rect.h &&
               now-lastButtonTime>repeatDelay){pixelWidth++;pixelHeight++; lastButtonTime=now;}
            if(mx>=decrease.rect.x && mx<=decrease.rect.x+decrease.rect.w &&
               my>=decrease.rect.y && my<=decrease.rect.y+decrease.rect.h &&
               now-lastButtonTime>repeatDelay){if(pixelWidth>1){pixelWidth--;pixelHeight--;} lastButtonTime=now;}
        }

        // Dessin uniquement si pas sur pickers
		// Déterminer si la souris est sur un picker
		bool overPicker=false;
		if(showColorPicker && mx>=picker.rect.x && mx<=picker.rect.x+picker.rect.w &&
		   my>=picker.rect.y && my<=picker.rect.y+picker.rect.h) overPicker=true;
		if(showShapePicker && mx>=shapePicker.rect.x && mx<=shapePicker.rect.x+shapePicker.rect.w &&
		   my>=shapePicker.rect.y && my<=shapePicker.rect.y+shapePicker.rect.h) overPicker=true;

		// Si on commence à draguer un picker, ou que la souris est sur un picker, on ne dessine pas et on reset lastX/lastY
		if(picker.dragging || shapePicker.dragging || overPicker){
			lastX = lastY = -1;
		}

		// Dessin uniquement si souris active et pas sur pickers
		if(mouseDown && !overPicker && !picker.dragging && !shapePicker.dragging && my>TOOLBAR_HEIGHT && pixelCount<MAX_PIXELS){
			if(lastX>=0 && lastY>=0){
				float dx=mx-lastX, dy=my-lastY;
				int steps=(int)sqrtf(dx*dx+dy*dy);
				if(steps==0) steps=1;
				for(int i=0;i<=steps && pixelCount<MAX_PIXELS;i++){
					float fx = lastX + dx*i/steps;
					float fy = lastY + dy*i/steps;
					pixels[pixelCount].x = fx - pixelWidth/2;
					pixels[pixelCount].y = fy - pixelHeight/2;
					pixels[pixelCount].w = pixelWidth;
					pixels[pixelCount].h = pixelHeight;
					pixels[pixelCount].color = currentColor;
					pixels[pixelCount].shape = currentShape;
					pixelCount++;
				}
			} else {
				pixels[pixelCount].x=mx-pixelWidth/2;
				pixels[pixelCount].y=my-pixelHeight/2;
				pixels[pixelCount].w=pixelWidth;
				pixels[pixelCount].h=pixelHeight;
				pixels[pixelCount].color=currentColor;
				pixels[pixelCount].shape=currentShape;
				pixelCount++;
			}
			lastX=mx;
			lastY=my;
		}



        // Suppression clic droit
        if(mouseRight){
            for(int i=pixelCount-1;i>=0;i--){
                if(mx>=pixels[i].x && mx<=pixels[i].x+pixels[i].w &&
                   my>=pixels[i].y && my<=pixels[i].y+pixels[i].h){
                    pixels[i]=pixels[pixelCount-1]; pixelCount--;
                }
            }
        }

        SDL_SetRenderDrawColor(renderer,0,0,0,255); SDL_RenderClear(renderer);
        for(int i=0;i<pixelCount;i++) renderPixel(renderer,pixels[i]);

        // Toolbar
        SDL_SetRenderDrawColor(renderer,100,100,100,255);
        SDL_FRect toolbar={0,0,WINDOW_WIDTH,TOOLBAR_HEIGHT}; SDL_RenderFillRect(renderer,&toolbar);
        renderButton(renderer,font,colorButton,0); renderButton(renderer,font,increase,36);
        renderButton(renderer,font,decrease,36); renderButton(renderer,font,shapeBtn,0);
        renderButton(renderer,font,erase,0);

        SDL_SetRenderDrawColor(renderer,currentColor.r,currentColor.g,currentColor.b,255);
        SDL_RenderFillRect(renderer,&colorPreview);

        char sizeText[16]; snprintf(sizeText,sizeof(sizeText),"%dx%d",pixelWidth,pixelHeight);
        SDL_Surface *sizeS=TTF_RenderText_Blended(font,sizeText,strlen(sizeText),(SDL_Color){255,255,255,255});
        SDL_Texture *sizeT=SDL_CreateTextureFromSurface(renderer,sizeS); SDL_DestroySurface(sizeS);
        float tw=0,th=0; SDL_GetTextureSize(sizeT,&tw,&th);
        SDL_FRect dstSize={(WINDOW_WIDTH-tw)/2.0f,(TOOLBAR_HEIGHT-th)/2.0f,tw,th};
        SDL_RenderTexture(renderer,sizeT,NULL,&dstSize); SDL_DestroyTexture(sizeT);

        char mainRGB[32];
        snprintf(mainRGB,sizeof(mainRGB),"R:%d G:%d B:%d",currentColor.r,currentColor.g,currentColor.b);
        TTF_Font *smallFont = TTF_OpenFont("Minecraft.ttf",14);
        SDL_Surface *surfRGB = TTF_RenderText_Blended(smallFont,mainRGB,strlen(mainRGB),(SDL_Color){255,255,255,255});
        SDL_Texture *texRGB = SDL_CreateTextureFromSurface(renderer,surfRGB);
        SDL_DestroySurface(surfRGB);
        SDL_FRect dstRGB = {WINDOW_WIDTH-200,5,0,0};
        SDL_GetTextureSize(texRGB,&tw,&th);
        dstRGB.w=tw; dstRGB.h=th;
        SDL_RenderTexture(renderer,texRGB,NULL,&dstRGB);
        SDL_DestroyTexture(texRGB);
        TTF_CloseFont(smallFont);

        // Pickers
        if(showColorPicker) renderColorPicker(renderer, font, &picker, mx, my, mouseDown, &currentColor);
        if(showShapePicker) renderShapePicker(renderer,font,&shapePicker,mx,my,mouseDown,&currentShape);

        SDL_RenderPresent(renderer); SDL_Delay(16);
    }

    TTF_CloseFont(font); SDL_DestroyRenderer(renderer); SDL_DestroyWindow(window);
    TTF_Quit(); SDL_Quit();
    return 0;
}
