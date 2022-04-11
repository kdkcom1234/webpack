### **1. 최적의 devtool 옵션을 선택하자.**

웹팩으로 코드를 번들링하게 되면 에러를 트래킹하기 어려워진다. 하지만 source map을 사용하게 되면 번들링된 파일의 코드를 소스 파일의 원래 위치로 다시 매핑해줘서, 어디서 에러가 발생했는지 알기 쉬워진다.

가능하면 소스맵을 생성하는 것이 좋은데, 어떤 source mapping 스타일을 선택하는지에 따라 빌드 및 리빌드 속도에 큰 영향을 미친다.

⚠️ 최적화 이전

```json
devtool: !isDevelopment ? 'hidden-source-map' : 'inline-source-map',
```

최적화 이전에는 프로덕션 모드에서는 hidden-source-map 이고, 개발 모드에서는 inline-source-map이었다.

devtool 옵션 중에 빌드와 리빌드 성능이 가장 느린 두 가지를 쓰고 있었다...ㅎㅎ;; 물론 코드 품질은 original 이어서 디버깅하기에는 최적이지만 성능은 최악인 옵션들이었다. 그래서 성능은 빠르면서 품질도 좋은 옵션으로 바꿔보고자 했다.

♻️ 최적화 이후

```json
devtool: env.development ? 'eval-cheap-module-source-map' : false,
```

웹팩 공식 문서 가이드를 보면 eval-cheap-module-source-map 옵션이 가장 좋다고 기재돼있다. 빌드는 느림이지만 리빌드는 빠름이고, 코드 품질이 original lines 여서 트랜스파일하기 전의 코드를 볼 수 있어 개발 모드에서 디버깅하기 좋은 옵션이라고 할 수 있다.

프로덕션 모드에서는 굳이 소스맵이 필요하지 않다고 생각해서 소스맵을 생성하지 않는 옵션을 줬다.

더 많은 옵션을 보고 고르고 싶다면 [여기서](https://webpack.kr/configuration/devtool/) 볼 수 있다.

### **2. 최적의 cache 타입을 선택하자.**

cache 타입을 설정하면 생성된 웹팩 모듈 및 청크를 캐시하여 빌드 속도를 개선할 수 있다.

cache는 개발 모드에서는 memory, 프로덕션 모드에서는 비활성화 되는 것이 디폴트로 세팅되어 있다.

최적화 이전에는 디폴트 상태로 냅뒀기 때문에 프로덕션 모드로 빌드할 때 비활성화 상태로 되어 있어서 캐싱이 전혀 안된 상태였기 때문에 빌드 성능이 좋지 않았다. 그래서 최적화 이후에는 개발 모드와 프로덕션 모드에서 별개로 타입을 설정했다.

♻️ 최적화 이후

```json
cache: { type: env.development ? 'memory' : 'filesystem' },
```

타입을 filesystem으로 설정하면 파일 시스템 캐시를 활성화하고 *node_modules/.cache/webpack* 경로에 캐싱된다.

이와 같이 캐싱을 통해 빌드 속도를 개선할 수 있고 filesystem으로 설정하면 [더 많은 옵션](https://webpack.kr/configuration/cache/)을 설정할 수 있다.

### **3. output 의 filename을 chunkhash로 저장하자.**

웹팩으로 빌드한 결과물인 파일 내용이 변경되지 않는 한 캐싱상태로 유지하면 브라우저에서 불필요한 네트워크 트래픽을 줄여서 웹 성능을 개선할 수 있다. 파일을 캐싱할 수 있는 방법 중에 하나는 output의 filename 옵션의 chunkhash 를 사용하는 것이다.

chunkhash를 사용하게 되면 파일이 변경될 경우에만 해시 값을 생성해서 파일 이름을 저장하게 된다.

⚠️ 최적화 이전

```json
output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '/build/',
},
```

♻️ 최적화 이후

```json
output: {
    pathinfo: false,
    path: path.join(__dirname, 'build'),
    filename: 'js/[name]-[chunkhash].js',
    assetModuleFilename: 'img/[hash][ext][query]',
    publicPath: '/',
    clean: true,
},
```

### **4. output 의 pathinfo를 false 로 설정하자.**

웹팩은 번들에 포함된 모듈에 대한 정보를 주석으로 번들에 포함하도록 생성한다. 그러나 수천 개의 모듈을 번들로 묶는 프로젝트에서는 가비지 컬렉션에 과부화를 주므로 pathinfo를 false 로 설정하는 것이 좋다.

### **5. 로더, 플러그인은 꼭 필요한 것만 사용하자.**

굳이 사용할 필요 없는 로더나 플러그인만 제거해도 빌드 성능이 개선된다. 그리고 개발 서버를 실행할 때 필요한 플러그인과 빌드할 때만 필요한 플러그인을 나눠서 실행하는 것도 성능을 개선하는데 큰 영향을 미친다.

**🏷 fork-ts-checker-webpack-plugin**

기존에는 빌드할 때도 실행되도록 했는데, 굳이 빌드할 때 필요하지 않다는 생각이 들었다.

그래서 개발 모드일 때만 실행하도록 했고, async: true 옵션을 줘서 컴파일을 빠르게 하고 별도의 프로세스에서 타입 체크도 할 수 있게 했다. 개발 모드일 때 async는 디폴트 값으로 true가 들어간다. 기존에는 false로 줘서 빌드도 느리고 컴파일도 느렸던 것으로 파악된다.

eslint와 이 플러그인의 목적은 둘다 컴파일 타임에 미리 에러를 잡아내는 것이다. 다만 eslint는 문법적으로 잘못된 부분을 잡아주고, type check 플러그인은 타입에 맞게 정확히 작성됐는지 검사해준다.

**🏷 webpack-bundle-analyzer**

기존에는 개발 모드일 때도 실행되도록 했는데, 굳이 개발할 때 필요하지 않다는 생각이 들었다.

그래서 빌드할 때만 실행되도록 했고, analyzerMode: 'static', openAnalyzer: false 옵션들을 줘서 html 파일로 생성되도록 하고 브라우저에서 자동으로 열리지 않도록 설정했다.

♻️ 최적화 이후

```json
if (env.WEBPACK_SERVE && config.plugins) {
    config.plugins.push(new ForkTsCheckerWebpackPlugin());
    config.plugins.push(new ReactRefreshWebpackPlugin());
}

if (!env.WEBPACK_SERVE && config.plugins) {
    config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }));
}
```

**🏷 file-loader**

기존에는 애셋을 처리할 때 file-loader를 사용했는데, Webpack5에서는 Asset modules가 새로 추가되어서 로더를 추가로 구성하지 않아도 애셋 파일을 사용할 수 있게 됐다.

그래서 file-loader를 대체하기 위해 **asset/resource** 모듈을 새로 추가해서 에셋을 처리했다.

파일을 출력 디렉토리로 내보낼 때 디렉토리 및 파일명을 정의할 수 있다. output.assetModuleFilename 에서 수정할 수 있다. 더 자세한 방법은 [여기서](https://webpack.kr/guides/asset-modules/) 확인 가능하다.

**🏷 clean-webpack-plugin**

기존에는 웹팩으로 번들링했던 결과물을 지우고 다시 번들링하기 위해 clean-webpack-plugin 을 사용했었다. 하지만 Webpack5 에서는 **output 에 clean이라는 옵션**이 생겨서 이 플러그인을 대체할 수 있게 됐다.

clean: true 옵션을 주게 되면 번들링해서 출력하기 전에 output 디렉토리를 정리해주고 새로 번들링된 결과물을 내보낸다.

♻️ 최적화 이후

```json
module: {
  rules: [
  ...
    {
      test: /\.(gif|jpg|png|webp|svg)$/,
      type: 'asset/resource',
    },
  ],
},

output: {
  ...
  assetModuleFilename: 'img/[hash][ext][query]',
  clean: true,
},
```

### **6. esbuild-loader를 사용하자.**

지금은 [자바스크립트 번들러의 춘추전국시대](https://2021.stateofjs.com/en-US/libraries/build-tools)라고 해도 과언이 아니다. 원래는 한동안 webpack이 주름을 잡고 있었는데, 최근들어 Vite, esbuild 등 다양한 번들러가 나왔고 웹팩보다 좋은 성능을 자랑하고 있다.

기존에는 webpack + babel-loader 조합으로 프로젝트를 구성했다. 하지만 이번에는 esbuild를 적용해서 성능을 높여보기로 했다.

![https://blog.kakaocdn.net/dn/KDZlA/btryExjHqhg/5NzFWh6eVCk2k59y2fAkgk/img.png](https://blog.kakaocdn.net/dn/KDZlA/btryExjHqhg/5NzFWh6eVCk2k59y2fAkgk/img.png)

https://esbuild.github.io/

esbuild는 Go 언어로 작성됐고, 파싱, 프린팅, 소스맵 추출 등 과정이 동시에 진행되며 빌드에 불필요한 단계를 줄여서 다른 번들러보다 속도를 확실히 빠르게 개선했다고 한다. 자세한 내용은 공식 문서에도 나와있으니 살펴보면 좋을 것 같다.

기존 webpack 생태계를 그대로 유지하되 esbuild를 적용하기 위해서 babel-loader를 **esbuild-loader**로 대체해보기로 했다.

대체하는 방법은 쉽다. 원래 babel-loader를 적용하던 곳에 esbuild-loader를 적용하면 된다.

⚠️ 최적화 이전

```json
module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  browsers: ['last 2 versions', 'ie >= 11'],
                },
                useBuiltIns: 'usage',
                corejs: 3,
                shippedProposals: true,
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
        },
      },
      ...
    ],
  },
```

♻️ 최적화 이후

```json
module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'esbuild-loader',
          options: {
            loader: 'tsx',
            target: 'es2015',
          },
        },
        ...
      ],
},
```

### **7. optimization.minimizer 플러그인을 사용하자.**

기본적으로 프로덕션 모드로 빌드할 때 optimization.minimize 옵션은 true로 설정돼있다. 이 옵션이 true이면 minimizer에 지정된 플러그인을 사용해서 번들을 최소화한다. 웹팩 공식 문서 가이드에는 [terser-webpack-plugin](https://webpack.kr/configuration/optimization/#optimizationminimizer)을 사용하는 것이 예제로 나와있다.

하지만 우리는 esbuild-loader를 사용할 것이기 때문에 이를 최대한으로 활용해보고자 한다.

esbuild-loader는 빌드 속도도 빠를 뿐만 아니라 Minification 툴도 함께 지원한다는 장점이 있다. 기존에 babel-loader를 사용했을 때는 파일 압축을 위해서 다양한 플러그인을 추가해야했는데, esbuild-loader는 ESBuildMinifyPlugin을 포함하고 있다.

ESBuildMinifyPlugin을 사용하면 terser-webpack-plugin과 css-minimizer-plugin을 대체할 수 있다.

이 플러그인은 다른 플러그인에 비해 [속도가 10배 이상 빠르고 번들 사이즈도 정말 작다](https://github.com/privatenumber/minification-benchmarks)고 한다.

minimizer에 플러그인을 추가하고 target, css 옵션을 설정해주면 끝이다.

♻️ 최적화 이후

```json
optimization: {
  minimizer: [
    new ESBuildMinifyPlugin({
      target: 'es2015',
      css: true,
    }),
  ],
},
```

### **8. devServer.static에 명확한 경로를 작성하자.**

webpack-dev-server는 웹팩에서 제공해주는 개발용 웹서버이다. 웹서버를 실행시키면 코드가 변경될 때 자동으로 변경된 파일만 다시 번들링하여 서버를 다시 구동해주는 역할도 한다. webpack-dev-server는 컴파일 후 출력 파일을 작성하지 않는다. 대신 번들링한 결과물을 메모리에 보관하고, 서버의 루트 경로에 마운트 된 실제 파일인 것처럼 제공한다.

devServer의 static 옵션은 번들링된 정적파일들을 담고 있는 디렉토리를 명시해준다. 즉 서버에 콘텐츠를 제공할 위치를 알려주는 역할을 하는데, devServer는 static 옵션에 설정된 디렉토리를 브라우저에 띄워주게된다. static 옵션을 설정하지 않으면 기본적으로 현재 작업 디렉토리 전체를 사용해서 콘텐츠를 제공하게 된다. 따라서 특정 디렉토리를 명시해주는 것이 번들링 속도를 높여줄 수 있다.

♻️ 최적화 이후

```json
devServer: {
  historyApiFallback: true,
  port: 3090,
  static: { directory: path.resolve(__dirname, 'build') },
  hot: true,
  open: true,
},
```
