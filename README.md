## Wobbly
[![NPM version][npm-image]][npm-url]

[**线上演示地址**](https://imtaotao.github.io/wobbly)<br/><br/>
这个是一个轻量级的 js 弹性动画库，能够帮助你轻松的创建弹性动画。几个简单的 api 就能快速上手

### [CDN][cdn] 
`<script src="https://cdn.jsdelivr.net/gh/imtaotao/wobbly/dist/wobbly.min.js"></script>`

## API
  + `Wobbly`
  + `Wobbly.move`
  + `Wobbly.all`
  + `Wobbly.color`

### Wobbly(options: Object, process: Function) : Animate
Wobbly 用于创建一个动画对象，每个动画对象包含 5 个方法

#### options
  +  `move`： 移动的距离，为一个数组 [start, end]
  +  `duration`： 动画持续时间
  +  `end`： 动画结束后的回调
  +  `normal`： 动画是否是使用正常匀速动画，默认 false

#### process
  由于 Wobbly 只会参与动画的计算，最终动画参数真正映射到视图需要开发者自己去做，这样能够带来更好的扩展性，`process` 回调用来接收 Wobbly 计算的参数

#### Animate
  +  `start`： 开始动画，如果当前动画正在进行，则不会触发，返回 `this`
  +  `stop`： 停止当前正在运行的动画，返回 `this`
  +  `reStart`： 停止当前正在运行的动画，并重新开始，返回 `this`
  +  `toStart`： 停止当前正在运行的动画，立即到开始位置，返回 `this`
  +  `toEnd`： 停止当前正在运行的动画，立即到结束位置，返回 `this`

#### Demo
```js
  // 这是一个重复的动画，每次持续 1s
  const animate = Wobbly({
    move: [0, 100],
    duration: 1000,
    end () {
      console.log('end')
      animate.start()
    },
  }, val => {
    node.style.transform = `translateX(${val}px)`
  })
  animate.start()
```


### Wobbly.move(move: [start, end], duration: number, process: Function) : Promise<Function>
Wobbly.move 方法用于简化操作，他将直接执行动画，并返回一个 promise，动画结束后执行，回调将接收一个 reStart 函数，
他将重新执行动画

#### Demo
```js
  // 这是一个执行 3 次的动画，每次持续 1s
  Wobbly.move([0, 100], 1000, val => {
    node.style.transform = `translateX(${val}px)`
  })
  .then(reStart => reStart())
  .then(reStart => reStart())
```


### Wobbly.all(allOptions: Object, process: Function) : Animate
Wobbly.all 将同时执行多个动画，allOptions 和 Wobbly 函数中的 option 唯一不同的就是 move 换成了 moves，moves 是一个 move 的集合。Wobbly.all 最终还是对每个动画调用 Wobbly 函数来进行的，但是 process 回调是等所有的单独动画都统一完成后才执行

#### Demo
```js
  // 这是一个重复的动画
  const animate = Wobbly.all({
    moves: [
      [0, 1], // scale
      [0, 600], // translate
      [72, 41], // r
      [85, 50], // g
      [99, 60], // b
    ],
    duration: 1500,
    end () {
      animate.start()
    },
  }, ([scale, translate, r, g, b]) => {
    node.style.background = `rgb(${r}, ${g}, ${b})`
    node.style.transform = `scale(${scale}) translateX(${translate}px)`
  })
  animate.start()
```


### Wobbly.color(start: string | array, end: string | array) : Array<[number, number]>
上面的 Wobbly.all 方法中的 demo 中我们对颜色的改变很麻烦，需要自己手动写 rgb 的值，对于 16进制的颜色值，我们还需要自己转换。这个 Wobbly.color 方法就是来帮助我们来转换的工具方法

```js
  // 以下 4 种写法都可以

  // [[72, 41], [85, 50], [99, 60]]
  Wobbly.color('#485563', '#29323c')

  // [[72, 41], [85, 50], [99, 60], [1, 1]]
  Wobbly.color('#485563', [41, 50, 60, 1])

  // [[72, 41], [85, 50], [99, 60], [0.5, 1]]
  Wobbly.color([72, 85, 99, 0.5], '#29323c')

  // [[72, 41], [85, 50], [99, 60], [0.5, 1]]
  Wobbly.color([72, 85, 99, 0.5], [41, 50, 60])
```

#### Demo
我们把上面的 Wobbly.all 方法的 demo 简化一下
```js
  const animate = Wobbly.all({
    moves: [
      [0, 1], // scale
      [0, 600], // translate
      ...Wobbly.color('#485563', '#29323c') // color
    ],
    duration: 1500,
    end () {
      animate.start()
    },
  }, ([scale, translate, r, g, b]) => {
    node.style.background = `rgb(${r}, ${g}, ${b})`
    node.style.transform = `scale(${scale}) translateX(${translate}px)`
  })
  animate.start()
```


## 结合 matrix 库
当我们对 transform 做更改的时候，发现需要移动的元素已经存在 transform，那么我们就不能很轻易的去移动，如果通过 getComputedStyle 方法去获取当前元素的值，你会发现得到的是一些 matrix 值。所以我们可以利用 [matrix](https://github.com/imtaotao/matrix) 这个库来做计算


[npm-url]: https://www.npmjs.com/package/@rustle/wobbly
[npm-image]: https://img.shields.io/npm/v/@rustle/wobbly.svg?style=flat-square
[cdn]: https://cdn.jsdelivr.net/gh/imtaotao/wobbly/dist/wobbly.min.js