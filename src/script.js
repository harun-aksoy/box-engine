import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.6.0.min.js"

const {a, div, li, p, ul} = van.tags
const { svg, defs, clipPath, path } = van.tags("http://www.w3.org/2000/svg")

const Hello = () => div(
  p("👋Hello"),
  ul(
    li("🗺️World"), 
    li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
  ),
)

// van.add(document.body, Hello())



let abc = div({style: "width:100px;height:100px;"},
  svg({width: "0", height: "0"},
    defs(
      clipPath({id: "squircle2", clipPathUnits: "objectBoundingBox"},
        path({transform: "scale(0.00625)", d: " M 0 80 C 0 20, 20 0, 80 0 S 160 20, 160 80 S 140 160, 80 160 S 0 140, 0 80 Z "}),
      ),
    ),
  ),
  div({style: " width:100%; height:100%; background:linear-gradient(hotpink,dodgerblue,deepskyblue); padding:3px; clip-path:url(#squircle2); box-sizing:border-box; "},
    div({style: " width:100%; height:100%; background:white; clip-path:url(#squircle2); "}),
  ), 
)

// van.add(document.body, abc)



//////////////////////////////////////////////



function Entity(props = {}) {
  const self = div()
  const store = {}

  self.props = (extra = {}) => {
    for (const [key, value] of Object.entries(extra)) {
      if (Array.isArray(value)) {
        store[key] = van.state(value)
        self[key] = (...args) => {
          if (args.length === 0) return store[key].val
          store[key].val = args.flat()
          return self
        }
      } else if (typeof value === 'object' && value !== null) {
        store[key] = {}
        for (const [k, v] of Object.entries(value)) store[key][k] = van.state(v)
        self[key] = (...args) => {
          if (args.length === 0) {
            const out = {}
            for (const k of Object.keys(store[key])) out[k] = store[key][k].val
            return out
          }
          Object.keys(store[key]).forEach((k, i) => {
            if (args[i] != null) store[key][k].val = args[i]
            else if (args.length === 1 && args[0] != null) store[key][k].val = args[0]
          })
          return self
        }
      } else {
        store[key] = van.state(value)
        self[key] = (...args) => {
          if (args.length === 0) return store[key].val
          store[key].val = args[0]
          return self
        }
      }
    }
    return self
  }

  self.props(props)
  return self
}



/////////////////////////////////////////



export function Text1(initialText = "") {
  const self = Box().flex(0)
  
  self.props({
    txt: initialText,
    color: null, // Varsayılan olarak null bıraktık
    size: 16,
    bold: false,
    italic: false,
    fontFamily: "sans-serif"
  })

  van.derive(() => {
    self.innerText = self.txt()

    const s = self.size()
    self.style.fontSize = typeof s === 'number' ? `${s}px` : s
    self.style.fontWeight = self.bold() ? "bold" : "normal"
    self.style.fontStyle = self.italic() ? "italic" : "normal"
    self.style.fontFamily = self.fontFamily()
    self.style.textAlign = 'center';

    const c = self.color()
    self.style.color = c.str()
  })

  return self
}


export function Text(initialText = "") {
  const self = Box().flex(0)
  
  self.props({
    txt: initialText,
    color: null, // Varsayılan olarak null bıraktık
    size: 16,
    bold: false,
    italic: false,
    fontFamily: "sans-serif"
  })
  //self.color(Color.black)
  const inner = Box().frame(0)
  inner.style.boxSizing= "content-box"
  inner.style.whiteSpace = "nowrap"
  inner.style.width = "max-content"
  inner.style.height = "max-content"
  self.overlay( inner )
  //van.add(self, inner)
  

  van.derive(() => {
    inner.innerText = self.txt()
    const rect = inner.getBoundingClientRect()
    self.frame(rect.width, rect.height)

    const s = self.size()
    inner.style.fontSize = typeof s === 'number' ? `${s}px` : s
    inner.style.fontWeight = self.bold() ? "bold" : "normal"
    inner.style.fontStyle = self.italic() ? "italic" : "normal"
    inner.style.fontFamily = self.fontFamily()
    inner.style.textAlign = 'center';

    const c = self.color()
    self.style.color = c.str()
  })

  return self
}



export function Image(src) { 
  const self = Box()

  self.props({ src, fit: false })

  van.derive(() => {
    const mode = self.fit() ? 'contain' : 'cover'
    self.style.background = `url('${self.src()}') center / ${mode} no-repeat`
  })

  return self
}



export function Color(r = 0, g = 0, b = 0, a = 1, br = 0.5) {
  const self = Box()
  self.props({ color: { r, g, b }, opacity: a, brightness: br, str: "" }) 

  van.derive(() => {
    const { r, g, b } = self.color()
    const a = self.opacity()
    const br = self.brightness()

    const calc = (val) => br <= 0.5 
      ? val * (br * 2) 
      : val + (1 - val) * ((br - 0.5) * 2)
    
    const rgbaString = `rgba(${Math.round(calc(r) * 255)}, ${Math.round(calc(g) * 255)}, ${Math.round(calc(b) * 255)}, ${a})`
    self.str(rgbaString)
    self.style.background = rgbaString
  })
  
  return self
} 

// Gradient Bileşeni
export function Gradient(...colors) {
  const self = Box()
  self.props({ angle: 180 })

  van.derive(() => {
    const angle = self.angle()
    const stops = colors.map( c => c.str() )
    self.style.background = `linear-gradient(${angle}deg, ${stops.join(', ')})`
  })

  return self
}


Object.defineProperty(Color, 'lime',    { get: () => Color( 164/255, 196/255, 0/255   ) })
Object.defineProperty(Color, 'green',   { get: () => Color( 96/255,  169/255, 23/255  ) })
Object.defineProperty(Color, 'emerald', { get: () => Color( 0/255,   138/255, 0/255   ) })
Object.defineProperty(Color, 'teal',    { get: () => Color( 0/255,   171/255, 169/255 ) })
Object.defineProperty(Color, 'cyan',    { get: () => Color( 27/255,  161/255, 226/255 ) })
Object.defineProperty(Color, 'cobalt',  { get: () => Color( 0/255,   80/255,  239/255 ) })
Object.defineProperty(Color, 'indigo',  { get: () => Color( 106/255, 0/255,   255/255 ) })
Object.defineProperty(Color, 'violet',  { get: () => Color( 170/255, 0/255,   255/255 ) })
Object.defineProperty(Color, 'pink',    { get: () => Color( 244/255, 114/255, 208/255 ) })
Object.defineProperty(Color, 'magenta', { get: () => Color( 216/255, 0/255,   115/255 ) })
Object.defineProperty(Color, 'crimson', { get: () => Color( 162/255, 0/255,   37/255  ) })
Object.defineProperty(Color, 'red',     { get: () => Color( 229/255, 20/255,  0/255   ) })
Object.defineProperty(Color, 'orange',  { get: () => Color( 250/255, 104/255, 0/255   ) })
Object.defineProperty(Color, 'amber',   { get: () => Color( 240/255, 163/255, 10/255  ) })
Object.defineProperty(Color, 'yellow',  { get: () => Color( 227/255, 200/255, 0/255   ) })
Object.defineProperty(Color, 'brown',   { get: () => Color( 130/255, 90/255,  44/255  ) })
Object.defineProperty(Color, 'olive',   { get: () => Color( 109/255, 135/255, 100/255 ) })
Object.defineProperty(Color, 'steel',   { get: () => Color( 100/255, 118/255, 135/255 ) })
Object.defineProperty(Color, 'mauve',   { get: () => Color( 118/255, 96/255,  138/255 ) })
Object.defineProperty(Color, 'taupe',   { get: () => Color( 135/255, 121/255, 78/255  ) })
Object.defineProperty(Color, 'white',   { get: () => Color( 255/255, 255/255, 255/255    ) })
Object.defineProperty(Color, 'black',   { get: () => Color( 0/255,   0/255,   0/255      ) })
Object.defineProperty(Color, 'clear',   { get: () => Color( 255/255, 255/255, 255/255, 0 ) })

Color.pico = {};
Object.defineProperty(Color.pico, 'black',       { get: () => Color( 0/255,   0/255,   0/255   ) })
Object.defineProperty(Color.pico, 'darkBlue',    { get: () => Color( 29/255,  43/255,  83/255  ) })
Object.defineProperty(Color.pico, 'darkPurple',  { get: () => Color( 126/255, 37/255,  83/255  ) })
Object.defineProperty(Color.pico, 'darkGreen',   { get: () => Color( 0/255,   135/255, 81/255  ) })
Object.defineProperty(Color.pico, 'brown',       { get: () => Color( 171/255, 82/255,  54/255  ) })
Object.defineProperty(Color.pico, 'darkGrey',    { get: () => Color( 95/255,  87/255,  79/255  ) })
Object.defineProperty(Color.pico, 'lightGrey',   { get: () => Color( 194/255, 195/255, 199/255 ) })
Object.defineProperty(Color.pico, 'white',       { get: () => Color( 255/255, 241/255, 232/255 ) })
Object.defineProperty(Color.pico, 'red',         { get: () => Color( 255/255, 0/255,   77/255  ) })
Object.defineProperty(Color.pico, 'orange',      { get: () => Color( 255/255, 163/255, 0/255   ) })
Object.defineProperty(Color.pico, 'yellow',      { get: () => Color( 255/255, 236/255, 39/255  ) })
Object.defineProperty(Color.pico, 'green',       { get: () => Color( 0/255,   228/255, 54/255  ) })
Object.defineProperty(Color.pico, 'blue',        { get: () => Color( 41/255,  173/255, 255/255 ) })
Object.defineProperty(Color.pico, 'lavender',    { get: () => Color( 131/255, 118/255, 156/255 ) })
Object.defineProperty(Color.pico, 'pink',        { get: () => Color( 255/255, 119/255, 168/255 ) })
Object.defineProperty(Color.pico, 'lightPeach',  { get: () => Color( 255/255, 204/255, 170/255 ) })



export const Shape = {
  // factor: 0 ile 1 arasında bir değer alır (Varsayılan: 1)
  squircle: (factor = 1) => (w, h) => {
    // Değeri 0 ile 1 arasında güvenliğe alalım
    const t = Math.max(0, Math.min(1, factor))
    
    // Köşelerin kaplayacağı maksimum alanı (yarıçapı) katsayıya göre hesapla
    const rx = (w / 2) * t
    const ry = (h / 2) * t
    
    // Bulduğun efsane katsayı: 20 / 80 = 0.25 (Kontrol noktası offset oranı)
    const cX = rx * 0.25
    const cY = ry * 0.25

    return `path('\
      M 0 ${ry} \
      C 0 ${cY}, ${cX} 0, ${rx} 0 \
      L ${w - rx} 0 \
      C ${w - cX} 0, ${w} ${cY}, ${w} ${ry} \
      L ${w} ${h - ry} \
      C ${w} ${h - cY}, ${w - cX} ${h}, ${w - rx} ${h} \
      L ${rx} ${h} \
      C ${cX} ${h}, 0 ${h - cY}, 0 ${h - ry} \
      Z\
    ')`
  },

  // Tam daire
  circle: () => (w, h) => {
    return `circle(${Math.min(w, h) / 2}px at 50% 50%)`
  },

  // Kapsül şekli (Kısa kenara göre tam yuvarlatılmış esnek yapı)
  capsule: () => (w, h) => {
    return Shape.squircle(1)(w, h)
  }
}


export const Effect = {
  blur:       (t = 1) => `blur(${t * 20}px)`,
  brightness: (t = 1) => `brightness(${t * 2})`,
  contrast:   (t = 1) => `contrast(${t * 2})`,
  saturate:   (t = 1) => `saturate(${t * 3})`,
  grayscale:  (t = 1) => `grayscale(${t})`,
  sepia:      (t = 1) => `sepia(${t})`,
  invert:     (t = 1) => `invert(${t})`,
  hueRotate:  (t = 1) => `hue-rotate(${t * 360}deg)`,
  dropShadow: (t = 1) => `drop-shadow(0 ${t * 10}px ${t * 20}px rgba(0,0,0,${t * 0.5}))`,
}



///////////////////////////////////////////////



export function Box() {
  const self = Entity({
    flex:     { w: 1, h: 1 },

    frame:    { w: 0, h: 0 },
    position: { x: 0, y: 0 },
    offset:   { x: 0, y: 0 },

    angle:    0,
    anchor:   { x: 0.5, y: 0.5 },

    stroke:   null,
    backdrop: null,
      
    effect:   null,
    shape:    null,
  })

  self.style.display   = "block"
  self.style.position  = "absolute"
  self.style.boxSizing = "border-box"
  self.style.margin    = "0"

  van.derive(() => {
    const f = self.frame()

    self.style.width  = `${f.w}px`
    self.style.height = `${f.h}px`
  })

  van.derive(() => {
    const p = self.position()
    const o = self.offset()

    self.style.left = `${p.x + o.x}px`
    self.style.top  = `${p.y + o.y}px`
  })

  van.derive(() => {
    self.style.transform =
      `translate(-50%,-50%) rotate(${self.angle()}deg)`

    self.style.transformOrigin =
      `${self.anchor().x * 100}% ${self.anchor().y * 100}%`
    
    self.style.backdropFilter = self.backdrop() ?? "none"
    self.style.webkitBackdropFilter = self.backdrop() ?? "none"
      
    // self.style.clipPath = self.stroke() ?? "none"
    // self.style.webkitClipPath = self.stroke() ?? "none"
    // const f = self.frame()
    // const stroke = self.stroke()
    // if (!stroke || f.w <= 0 || f.h <= 0) {
    //     self.style.clipPath = "none"
    //     self.style.webkitClipPath = "none"
    //   } else {
    //     const clip = stroke(f.w, f.h)
    //     self.style.clipPath = clip
    //     self.style.webkitClipPath = clip
    //   }
     
  })
      
  self.background = (...layers) => {
    const bg = ZBox(...layers)
    bg.style.zIndex = "-1"
    van.derive(() => {
      const f = self.frame()
      const shape = self.shape()
      const effect = self.effect()
      
      bg
        .frame(f.w, f.h)
        .position(f.w * 0.5, f.h * 0.5)
        
      layers[0].style.backdropFilter = self.effect() ?? "none" 
      layers[0].style.webkitBackdropFilter = self.effect() ?? "none"
  
      if (!shape || f.w <= 0 || f.h <= 0) {
        bg.style.clipPath = "none"
        bg.style.webkitClipPath = "none"
      } else {
        const clip = shape(f.w, f.h)
        bg.style.clipPath = clip
        bg.style.webkitClipPath = clip
      }
    })
    van.add(self, bg)
    return self
  }

  self.overlay = (...layers) => {
    const ov = ZBox(...layers)
    ov.style.zIndex = "1"
    van.derive(() => {
      const f = self.frame()
      ov
        .frame(f.w, f.h)
        .position(f.w * 0.5, f.h * 0.5)
    })
    van.add(self, ov)
    return self
  }
  
  return self
}


// ─── ZBox ────────────────────────────────────────────────────────────────────
// Tüm child'lar üst üste, container'ı dolduracak şekilde.
export function ZBox(...children) {
  const self = Box()

  self.props({
    gap:     0,
    padding: { x: 0, y: 0 },
    child:   children,
  })

  van.derive(() => {
    const kids  = self.child()
    const frame = self.frame()
    const pad   = self.padding()

    const iW = Math.max(0, frame.w - pad.x * 2)
    const iH = Math.max(0, frame.h - pad.y * 2)

    kids.forEach(child => {
      const cf = child.frame()
      child
        .frame(cf.w > 0 ? cf.w : iW, cf.h > 0 ? cf.h : iH)
        .position(pad.x + iW * 0.5, pad.y + iH * 0.5)
    })
  })

  van.add(self, ...children)
  return self
}


// ─── VBox ────────────────────────────────────────────────────────────────────
// Child'lar dikey sıralanır, flex ile kalan alan paylaşılır.
export function VBox(...children) {
  const self = Box()

  self.props({
    gap:     0,
    padding: { x: 0, y: 0 },
    child:   children,
  })

  van.derive(() => {
    const kids = self.child()
    if (!kids.length) return

    const gap   = self.gap()
    const pad   = self.padding()
    const frame = self.frame()

    const iW        = Math.max(0, frame.w - pad.x * 2)
    const iH        = Math.max(0, frame.h - pad.y * 2)
    const totalGap  = gap * (kids.length - 1)
    const totalFlex = kids.reduce((s, c) => s + (c.frame().h > 0 ? 0 : c.flex().h), 0)
    const fixedH    = kids.reduce((s, c) => s + (c.frame().h > 0 ? c.frame().h : 0), 0)
    const unit      = totalFlex > 0 ? (iH - fixedH - totalGap) / totalFlex : 0

    let y = 0
    kids.forEach(child => {
      const h = child.frame().h > 0 ? child.frame().h : unit * child.flex().h
      const w = child.frame().w > 0 ? child.frame().w : iW
      child.frame(w, h).position(pad.x + iW * 0.5, pad.y + y + h * 0.5)
      y += h + gap
    })
  })

  van.add(self, ...children)
  return self
}


// ─── HBox ────────────────────────────────────────────────────────────────────
// Child'lar yatay sıralanır, flex ile kalan alan paylaşılır.
export function HBox(...children) {
  const self = Box()

  self.props({
    gap:     0,
    padding: { x: 0, y: 0 },
    child:   children,
  })

  van.derive(() => {
    const kids = self.child()
    if (!kids.length) return

    const gap   = self.gap()
    const pad   = self.padding()
    const frame = self.frame()

    const iW        = Math.max(0, frame.w - pad.x * 2)
    const iH        = Math.max(0, frame.h - pad.y * 2)
    const totalGap  = gap * (kids.length - 1)
    const totalFlex = kids.reduce((s, c) => s + (c.frame().w > 0 ? 0 : c.flex().w), 0)
    const fixedW    = kids.reduce((s, c) => s + (c.frame().w > 0 ? c.frame().w : 0), 0)
    const unit      = totalFlex > 0 ? (iW - fixedW - totalGap) / totalFlex : 0

    let x = 0
    kids.forEach(child => {
      const w = child.frame().w > 0 ? child.frame().w : unit * child.flex().w
      const h = child.frame().h > 0 ? child.frame().h : iH
      child.frame(w, h).position(pad.x + x + w * 0.5, pad.y + iH * 0.5)
      x += w + gap
    })
  })

  van.add(self, ...children)
  return self
}



//////////////////////////////////////////



export function Page(fn) {
  document.body.style.cssText = "margin:0; padding:0; width:100vw; height:100vh; overflow:hidden;"
  const w = van.state(window.innerWidth)
  const h = van.state(window.innerHeight)
  window.addEventListener("resize", () => {
    w.val = window.innerWidth
    h.val = window.innerHeight
  })
  Page.frame = { w, h }
  let prev = null
  
  van.derive(() => {
    if (prev) { prev.remove(); prev = null }
    const content = fn()
    if (content) {
      // 1. İçeriğin kendi atanmış frame'ini kontrol et
      const currentFrame = content.frame()
      
      // 2. Eğer kullanıcı bir boyut verdiyse onu tut, vermediyse ekran boyutunu kullan
      const finalW = currentFrame.w !== 0 ? currentFrame.w : w.val
      const finalH = currentFrame.h !== 0 ? currentFrame.h : h.val
      
      // 3. Merkeze hizalayarak boyutları uygula
      content.frame(finalW, finalH).position(w.val * 0.5, h.val * 0.5)
      van.add(document.body, content)
      prev = content
    }
  })
}

Object.defineProperty(Page, 'small',  { get: () => Page.frame.w.val < 600 })
Object.defineProperty(Page, 'medium', { get: () => Page.frame.w.val >= 600 && Page.frame.w.val < 1024 })
Object.defineProperty(Page, 'large',  { get: () => Page.frame.w.val >= 1024 })


// Page(page => 
//   Page.small ? Image('https://placehold.net/1-800x600.png').fit(true) :
//   View(
//     View(
//         Color.red.frame(10,10).offset(-5,null),View()
//     ).frame(40).axis(true),
//     Gradient(Color.red,Color.pink).angle(100).opacity(0.5).frame(100).shape(Shape.squircle(.7)).effect(Effect.blur(0.5)),
//     Color.blue,
//     Color.green,
//   )
//   .gap(8)
// )








// const colorList = Array.from({ length: 10 }, (_, i) => Color.red)
// 
// Page(page =>
//   Page.small
//     ? Image('https://placehold.net/1-800x600.png').fit(true)
// 
//     : VBox(
// 
//         HBox(
//           Color.red
//             .frame(10,10)
//             .offset(-5,null),
// 
//           Box() // Spacer
//         )
//         .frame(40)
//         .background(Color.pink),
// 
//         Box()
//           .frame(70)
//           .angle(30)
//           .shape(Shape.squircle(.7))
//           .background(
//             Color(1,1,1).opacity(0.5).effect(Effect.blur(.4))
//           )
//           .overlay(
//             Color.green.frame(200,10)
//           ),
// 
//         Color(0,0,0).opacity(0.2).backdrop(Effect.blur(.4)).stroke(Shape.squircle(.5)).flex(2), 
//     
//         Color.red, Text('hello asdasd').color(Color.white).background(Color.taupe) ,
//     
//         Color.cyan.offset(100,0),
//     
//         // [...Array(10)].forEach((_, i) => Color.red.offset(i * 10, 0)),
//         // Array.from({ length: 10 }).forEach((_, i) => Color.red.offset(i * 10, 0))
// 
//       )
//       .gap(8).padding(20).frame(200,300).background(Gradient(Color.white,Color.pico.yellow).angle(-70)).shape(Shape.squircle(.7))
// )

