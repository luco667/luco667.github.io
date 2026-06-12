#include <SDL3/SDL.h>
#include <SDL3_ttf/SDL_ttf.h>
#include <SDL3_image/SDL_image.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <math.h>
#include <stdlib.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

#define WINDOW_WIDTH  640
#define WINDOW_HEIGHT 480
#define MAX_PIXELS    50000
#define TOOLBAR_HEIGHT 41

typedef enum { SHAPE_SQUARE, SHAPE_CIRCLE, SHAPE_TRIANGLE } ShapeType;
typedef struct { SDL_FRect rect; const char *label; } Button;
typedef struct { float x, y, w, h; SDL_Color color; ShapeType shape; } Pixel;

int clamp(int val, int min, int max) {
    return val < min ? min : (val > max ? max : val);
}

EM_JS(void, save_canvas, (), {
    const canvas = document.querySelector("canvas");

    canvas.toBlob(function(blob) {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "drawing.png";
        a.click();
        URL.revokeObjectURL(a.href);
    });
});

/* ─── Rendu bouton ─────────────────────────────────────────────────────────── */
void renderButton(SDL_Renderer *renderer, TTF_Font *font, Button btn, int fontSize) {
    SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
    SDL_RenderFillRect(renderer, &btn.rect);
    if (font) {
        TTF_Font *tmpFont = font;
        if (fontSize) tmpFont = TTF_OpenFont("Minecraft.ttf", fontSize);
        SDL_Surface *surf = TTF_RenderText_Blended(tmpFont, btn.label, strlen(btn.label), (SDL_Color){0,0,0,255});
        SDL_Texture *tex  = SDL_CreateTextureFromSurface(renderer, surf);
        SDL_DestroySurface(surf);
        float tw = 0, th = 0;
        SDL_GetTextureSize(tex, &tw, &th);
        SDL_FRect dst = { btn.rect.x + (btn.rect.w - tw) / 2,
                          btn.rect.y + (btn.rect.h - th) / 2, tw, th };
        SDL_RenderTexture(renderer, tex, NULL, &dst);
        SDL_DestroyTexture(tex);
        if (fontSize) TTF_CloseFont(tmpFont);
    }
}

/* ─── Cercle plein ─────────────────────────────────────────────────────────── */
void renderFilledCircle(SDL_Renderer *renderer, float cx, float cy, float radius, SDL_Color c) {
    SDL_SetRenderDrawColor(renderer, c.r, c.g, c.b, c.a);
    int r = (int)radius;
    for (int y = -r; y <= r; y++) {
        int dx = (int)sqrtf((float)(r * r - y * y));
        SDL_RenderLine(renderer, cx - dx, cy + y, cx + dx, cy + y);
    }
}

/* ─── Rendu pixel (carré / cercle / triangle) ─────────────────────────────── */
void renderPixel(SDL_Renderer *renderer, Pixel p) {
    if (p.shape == SHAPE_SQUARE) {
        SDL_SetRenderDrawColor(renderer, p.color.r, p.color.g, p.color.b, p.color.a);
        SDL_FRect r = { p.x, p.y, p.w, p.h };
        SDL_RenderFillRect(renderer, &r);
    } else if (p.shape == SHAPE_CIRCLE) {
        renderFilledCircle(renderer, p.x + p.w / 2, p.y + p.h / 2, p.w / 2, p.color);
    } else if (p.shape == SHAPE_TRIANGLE) {
        SDL_Vertex v[3];
        float cx = p.x + p.w / 2, cy = p.y + p.h / 2;
        v[0].position = (SDL_FPoint){ cx,            cy - p.h / 2 };
        v[1].position = (SDL_FPoint){ cx - p.w / 2,  cy + p.h / 2 };
        v[2].position = (SDL_FPoint){ cx + p.w / 2,  cy + p.h / 2 };
        for (int i = 0; i < 3; i++) {
            v[i].color     = (SDL_FColor){ p.color.r / 255.0f, p.color.g / 255.0f,
                                           p.color.b / 255.0f, p.color.a / 255.0f };
            v[i].tex_coord = (SDL_FPoint){ 0, 0 };
        }
        SDL_RenderGeometry(renderer, NULL, v, 3, NULL, 0);
    }
}

/* ─── Structs pickers ──────────────────────────────────────────────────────── */
typedef struct { SDL_FRect rect; int *r, *g, *b; bool dragging; } ColorPicker;
typedef struct { SDL_FRect rect; bool dragging; }                   ShapePicker;

/* ─── Color picker ─────────────────────────────────────────────────────────── */
void renderColorPicker(SDL_Renderer *renderer, TTF_Font *font, ColorPicker *picker,
                       float mx, float my, bool mouseDown, SDL_Color *currentColor)
{
    SDL_SetRenderDrawColor(renderer, 60, 60, 60, 255);
    SDL_RenderFillRect(renderer, &picker->rect);

    SDL_FRect dragBar = { picker->rect.x, picker->rect.y, picker->rect.w, 30 };
    SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
    SDL_RenderFillRect(renderer, &dragBar);

    if (mouseDown && mx >= dragBar.x && mx <= dragBar.x + dragBar.w &&
        my >= dragBar.y && my <= dragBar.y + dragBar.h)
        picker->dragging = true;
    if (!mouseDown) picker->dragging = false;

    if (picker->dragging) {
        picker->rect.x = mx - picker->rect.w / 2;
        picker->rect.y = my - 15;
    }

    SDL_FRect preview = { picker->rect.x + 20, picker->rect.y + 50,
                          picker->rect.w - 40, 40 };
    SDL_SetRenderDrawColor(renderer, *picker->r, *picker->g, *picker->b, 255);
    SDL_RenderFillRect(renderer, &preview);

    float sliderW = picker->rect.w - 40;
    float sliderH = 12;
    float startX  = picker->rect.x + 20;
    float startY  = picker->rect.y + 100;
    SDL_Color colors[3] = { {255,0,0,255}, {0,255,0,255}, {0,0,255,255} };
    int *values[3] = { picker->r, picker->g, picker->b };

    for (int i = 0; i < 3; i++) {
        SDL_FRect bg   = { startX, startY + i * 25, sliderW, sliderH };
        SDL_FRect fill = { bg.x, bg.y, (*values[i] / 255.0f) * sliderW, sliderH };

        SDL_SetRenderDrawColor(renderer, 80, 80, 80, 255);
        SDL_RenderFillRect(renderer, &bg);
        SDL_SetRenderDrawColor(renderer, colors[i].r, colors[i].g, colors[i].b, 255);
        SDL_RenderFillRect(renderer, &fill);

        if (mouseDown && mx >= bg.x && mx <= bg.x + sliderW &&
            my >= bg.y  && my <= bg.y + sliderH)
            *values[i] = clamp((int)((mx - bg.x) / sliderW * 255), 0, 255);

        currentColor->r = *picker->r;
        currentColor->g = *picker->g;
        currentColor->b = *picker->b;
    }

    char rgbText[32];
    snprintf(rgbText, sizeof(rgbText), "R:%d G:%d B:%d", *picker->r, *picker->g, *picker->b);
    TTF_Font *smallFont = TTF_OpenFont("Minecraft.ttf", 16);
    SDL_Surface *surf = TTF_RenderText_Blended(smallFont, rgbText, strlen(rgbText),
                                               (SDL_Color){255,255,255,255});
    SDL_Texture *tex  = SDL_CreateTextureFromSurface(renderer, surf);
    SDL_DestroySurface(surf);
    float tw = 0, th = 0;
    SDL_GetTextureSize(tex, &tw, &th);
    SDL_FRect dst = { picker->rect.x + 10,
                      picker->rect.y + picker->rect.h - th - 10, tw, th };
    SDL_RenderTexture(renderer, tex, NULL, &dst);
    SDL_DestroyTexture(tex);
    TTF_CloseFont(smallFont);
}

/* ─── Shape picker ─────────────────────────────────────────────────────────── */
void renderShapePicker(SDL_Renderer *renderer, TTF_Font *font, ShapePicker *picker,
                       float mx, float my, bool mouseDown, ShapeType *currentShape)
{
    SDL_SetRenderDrawColor(renderer, 70, 70, 70, 255);
    SDL_RenderFillRect(renderer, &picker->rect);

    float dragBarW = picker->rect.w / 2;
    SDL_FRect dragBar = { picker->rect.x + (picker->rect.w - dragBarW) / 2,
                          picker->rect.y, dragBarW, 30 };
    SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
    SDL_RenderFillRect(renderer, &dragBar);

    if (mouseDown && mx >= dragBar.x && mx <= dragBar.x + dragBar.w &&
        my >= dragBar.y && my <= dragBar.y + dragBar.h)
        picker->dragging = true;
    if (!mouseDown) picker->dragging = false;

    if (picker->dragging) {
        picker->rect.x = mx - picker->rect.w / 2;
        picker->rect.y = my - 15;
    }

    const char *shapes[] = { "Square", "Round", "Triangle" };
    float tw = 0, th = 0;
    float btnYStart = picker->rect.y + dragBar.h + 10;

    for (int i = 0; i < 3; i++) {
        SDL_FRect btn = { picker->rect.x + 10, btnYStart + i * 40,
                          picker->rect.w - 20, 30 };
        SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
        SDL_RenderFillRect(renderer, &btn);

        SDL_Surface *s = TTF_RenderText_Blended(font, shapes[i], strlen(shapes[i]),
                                                (SDL_Color){0,0,0,255});
        SDL_Texture *t = SDL_CreateTextureFromSurface(renderer, s);
        SDL_DestroySurface(s);
        SDL_GetTextureSize(t, &tw, &th);
        SDL_FRect dst = { btn.x + (btn.w - tw) / 2, btn.y + (btn.h - th) / 2, tw, th };
        SDL_RenderTexture(renderer, t, NULL, &dst);
        SDL_DestroyTexture(t);

        if (mouseDown && mx >= btn.x && mx <= btn.x + btn.w &&
            my >= btn.y  && my <= btn.y + btn.h)
            *currentShape = (ShapeType)i;
    }
}

/* ══════════════════════════════════════════════════════════════════════════════
   État global  (nécessaire pour emscripten_set_main_loop)
   ══════════════════════════════════════════════════════════════════════════════ */
typedef struct {
    SDL_Window   *window;
    SDL_Renderer *renderer;
    TTF_Font     *font;

    Button colorButton, increase, decrease, shapeBtn, erase, saveBtn;
    SDL_FRect colorPreview;

    int        pixelWidth, pixelHeight;
    SDL_Color  currentColor;
    Pixel     *pixels;          /* ← malloc, plus de stack overflow */
    int        pixelCount;
    ShapeType  currentShape;

    bool running, mouseDown, mouseRight;
    bool showColorPicker, showShapePicker;
    bool clicked;

    int   pickerR, pickerG, pickerB;
    float lastX, lastY;
    Uint32 lastButtonTime;

    ColorPicker picker;
    ShapePicker shapePicker;
} AppState;

static AppState g;   /* instance unique globale */

/* ─── Une frame ────────────────────────────────────────────────────────────── */
void main_loop(void) {
    SDL_Event e;
    while (SDL_PollEvent(&e)) {
        if (e.type == SDL_EVENT_QUIT) {
#ifdef __EMSCRIPTEN__
            emscripten_cancel_main_loop();
#else
            g.running = false;
#endif
        }
        if (e.type == SDL_EVENT_MOUSE_BUTTON_DOWN) {
            if (e.button.button == SDL_BUTTON_LEFT)  { g.mouseDown  = true;  g.clicked = false; }
            if (e.button.button == SDL_BUTTON_RIGHT)   g.mouseRight = true;
        }
        if (e.type == SDL_EVENT_MOUSE_BUTTON_UP) {
            if (e.button.button == SDL_BUTTON_LEFT)  g.mouseDown  = false;
            if (e.button.button == SDL_BUTTON_RIGHT) g.mouseRight = false;
            g.lastX = g.lastY = -1;
        }
    }

    float mx = 0, my = 0;
    SDL_GetMouseState(&mx, &my);
    Uint32 now = SDL_GetTicks();

    /* Boutons toolbar */
    if (g.mouseDown && !g.clicked) {
#define HIT(btn) (mx>=(btn).rect.x && mx<=(btn).rect.x+(btn).rect.w && \
                  my>=(btn).rect.y && my<=(btn).rect.y+(btn).rect.h)
        if (HIT(g.colorButton)) { g.showColorPicker = !g.showColorPicker; g.clicked = true; }
        if (HIT(g.shapeBtn))    { g.showShapePicker = !g.showShapePicker; g.clicked = true; }
        if (HIT(g.erase))       { g.pixelCount = 0;                        g.clicked = true; }
        if (HIT(g.increase) && now - g.lastButtonTime > 50)
            { g.pixelWidth++; g.pixelHeight++; g.lastButtonTime = now; }
        if (HIT(g.decrease) && now - g.lastButtonTime > 50)
            { if (g.pixelWidth > 1) { g.pixelWidth--; g.pixelHeight--; } g.lastButtonTime = now; }
        if (HIT(g.saveBtn)) {
            save_canvas();
            g.clicked = true;
        }
#undef HIT
    }

    /* Détection survol picker */
    bool overPicker = false;
    if (g.showColorPicker &&
        mx >= g.picker.rect.x && mx <= g.picker.rect.x + g.picker.rect.w &&
        my >= g.picker.rect.y && my <= g.picker.rect.y + g.picker.rect.h)
        overPicker = true;
    if (g.showShapePicker &&
        mx >= g.shapePicker.rect.x && mx <= g.shapePicker.rect.x + g.shapePicker.rect.w &&
        my >= g.shapePicker.rect.y && my <= g.shapePicker.rect.y + g.shapePicker.rect.h)
        overPicker = true;

    if (g.picker.dragging || g.shapePicker.dragging || overPicker)
        g.lastX = g.lastY = -1;

    /* Dessin */
    if (g.mouseDown && !overPicker && !g.picker.dragging && !g.shapePicker.dragging &&
        my > TOOLBAR_HEIGHT && g.pixelCount < MAX_PIXELS)
    {
        if (g.lastX >= 0 && g.lastY >= 0) {
            float dx = mx - g.lastX, dy = my - g.lastY;
            int steps = (int)sqrtf(dx * dx + dy * dy);
            if (steps == 0) steps = 1;
            for (int i = 0; i <= steps && g.pixelCount < MAX_PIXELS; i++) {
                float fx = g.lastX + dx * i / steps;
                float fy = g.lastY + dy * i / steps;
                g.pixels[g.pixelCount++] = (Pixel){
                    fx - g.pixelWidth / 2, fy - g.pixelHeight / 2,
                    (float)g.pixelWidth,   (float)g.pixelHeight,
                    g.currentColor, g.currentShape
                };
            }
        } else {
            g.pixels[g.pixelCount++] = (Pixel){
                mx - g.pixelWidth / 2, my - g.pixelHeight / 2,
                (float)g.pixelWidth,   (float)g.pixelHeight,
                g.currentColor, g.currentShape
            };
        }
        g.lastX = mx; g.lastY = my;
    }

    /* Suppression clic droit */
    if (g.mouseRight) {
        for (int i = g.pixelCount - 1; i >= 0; i--) {
            if (mx >= g.pixels[i].x && mx <= g.pixels[i].x + g.pixels[i].w &&
                my >= g.pixels[i].y && my <= g.pixels[i].y + g.pixels[i].h) {
                g.pixels[i] = g.pixels[g.pixelCount - 1];
                g.pixelCount--;
            }
        }
    }

    /* ─── Rendu ─── */
    SDL_SetRenderDrawColor(g.renderer, 0, 0, 0, 255);
    SDL_RenderClear(g.renderer);

    for (int i = 0; i < g.pixelCount; i++)
        renderPixel(g.renderer, g.pixels[i]);

    /* Toolbar */
    SDL_SetRenderDrawColor(g.renderer, 100, 100, 100, 255);
    int ww, wh;
    SDL_GetWindowSize(g.window, &ww, &wh);

    SDL_FRect toolbar = { 0, 0, ww, TOOLBAR_HEIGHT };
    SDL_RenderFillRect(g.renderer, &toolbar);
    renderButton(g.renderer, g.font, g.colorButton, 0);
    renderButton(g.renderer, g.font, g.increase,    36);
    renderButton(g.renderer, g.font, g.decrease,    36);
    renderButton(g.renderer, g.font, g.shapeBtn,    0);
    renderButton(g.renderer, g.font, g.erase,       0);
    renderButton(g.renderer, g.font, g.saveBtn, 0);

    SDL_SetRenderDrawColor(g.renderer, g.currentColor.r, g.currentColor.g,
                           g.currentColor.b, 255);
    SDL_RenderFillRect(g.renderer, &g.colorPreview);

    /* Taille du pinceau */
    char sizeText[16];
    snprintf(sizeText, sizeof(sizeText), "%dx%d", g.pixelWidth, g.pixelHeight);
    SDL_Surface *sizeS = TTF_RenderText_Blended(g.font, sizeText, strlen(sizeText),
                                                (SDL_Color){255,255,255,255});
    SDL_Texture *sizeT = SDL_CreateTextureFromSurface(g.renderer, sizeS);
    SDL_DestroySurface(sizeS);
    float tw = 0, th = 0;
    SDL_GetTextureSize(sizeT, &tw, &th);
    SDL_FRect dstSize = { (WINDOW_WIDTH - tw) / 2.0f, (TOOLBAR_HEIGHT - th) / 2.0f, tw, th };
    SDL_RenderTexture(g.renderer, sizeT, NULL, &dstSize);
    SDL_DestroyTexture(sizeT);

    /* RGB affiché dans la toolbar */
    char mainRGB[32];
    snprintf(mainRGB, sizeof(mainRGB), "R:%d G:%d B:%d",
             g.currentColor.r, g.currentColor.g, g.currentColor.b);
    TTF_Font *smallFont = TTF_OpenFont("Minecraft.ttf", 14);
    SDL_Surface *surfRGB = TTF_RenderText_Blended(smallFont, mainRGB, strlen(mainRGB),
                                                  (SDL_Color){255,255,255,255});
    SDL_Texture *texRGB  = SDL_CreateTextureFromSurface(g.renderer, surfRGB);
    SDL_DestroySurface(surfRGB);
    SDL_FRect dstRGB = {ww - tw - 60,(TOOLBAR_HEIGHT - th) / 2,tw,th};
    SDL_GetTextureSize(texRGB, &tw, &th);
    dstRGB.w = tw; dstRGB.h = th;
    SDL_RenderTexture(g.renderer, texRGB, NULL, &dstRGB);
    SDL_DestroyTexture(texRGB);
    TTF_CloseFont(smallFont);

    /* Pickers */
    if (g.showColorPicker)
        renderColorPicker(g.renderer, g.font, &g.picker, mx, my, g.mouseDown, &g.currentColor);
    if (g.showShapePicker)
        renderShapePicker(g.renderer, g.font, &g.shapePicker, mx, my, g.mouseDown, &g.currentShape);

    SDL_RenderPresent(g.renderer);
}

/* ══════════════════════════════════════════════════════════════════════════════
   main
   ══════════════════════════════════════════════════════════════════════════════ */
int main(void) {
    SDL_Init(SDL_INIT_VIDEO);
    TTF_Init();

    g.window   = SDL_CreateWindow("DRAW PIXELS", WINDOW_WIDTH, WINDOW_HEIGHT, 0);
    g.renderer = SDL_CreateRenderer(g.window, NULL);
    g.font     = TTF_OpenFont("Minecraft.ttf", 24);

    int w, h;
    SDL_GetWindowSize(g.window, &w, &h);

    float btnSize = TOOLBAR_HEIGHT - 2;

    g.colorButton = (Button){{ 0 * btnSize, 0, btnSize, btnSize }, "C"};
    g.increase    = (Button){{ 1 * btnSize, 0, btnSize, btnSize }, "+"};
    g.decrease    = (Button){{ 2 * btnSize, 0, btnSize, btnSize }, "-"};
    g.shapeBtn    = (Button){{ 3 * btnSize, 0, btnSize, btnSize }, "S"};
    g.erase       = (Button){{ 4 * btnSize, 0, btnSize, btnSize }, "E"};
    g.saveBtn     = (Button){{ 5 * btnSize, 0, btnSize, btnSize }, "P"};
    g.colorPreview = (SDL_FRect){ WINDOW_WIDTH - 50, 0, 40, 40 };

    g.pixelWidth  = 5;
    g.pixelHeight = 5;
    g.currentColor = (SDL_Color){255, 0, 0, 255};

    /* ← Allocation sur le heap, plus de stack overflow */
    g.pixels = (Pixel *)malloc(MAX_PIXELS * sizeof(Pixel));

    g.pixelCount  = 0;
    g.currentShape = SHAPE_SQUARE;
    g.running     = true;
    g.lastX = g.lastY = -1;
    g.pickerR = 255; g.pickerG = 0; g.pickerB = 0;

    g.picker      = (ColorPicker){{100, 100, 300, 200}, &g.pickerR, &g.pickerG, &g.pickerB, false};
    g.shapePicker = (ShapePicker){{150, 150, 150, 170}, false};

#ifdef __EMSCRIPTEN__
    /* 0 = fps géré par le navigateur (requestAnimationFrame), 1 = boucle infinie simulée */
    emscripten_set_main_loop(main_loop, 0, 1);
#else
    while (g.running) {
        main_loop();
        SDL_Delay(16);
    }
#endif

    free(g.pixels);
    TTF_CloseFont(g.font);
    SDL_DestroyRenderer(g.renderer);
    SDL_DestroyWindow(g.window);
    TTF_Quit();
    SDL_Quit();
    return 0;
}
