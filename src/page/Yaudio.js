(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = global.document ? factory(global, true) : function (w) {
      if (!w.window) {
        throw  new Error('yAudio requires a window with a document');
      }
      return factory(w);
    }
  } else {
    factory(global);
  }
})(typeof window !== 'underfined' ? window : this, function (window, noGlobal) {
  const yAudio = function(options = {}) {
      this.$options = options;
      let isCreate = false;
      window.addEventListener('click',() =>{
        isCreate = true;
        this.$ctx =  new (window.AudioContext || window.webkitAudioContext)({...options.params})
        this.$assembler = {};
        this.$listener =  this.$ctx.listener;
        this.$status = false;
        this.$ready = false;
        this._init(this.$ctx, options);
      })
    if(isCreate) {
      window.removeEventListener('click');
    }
      return Promise.resolve(this)
  }
  yAudio.prototype = {
    getBuffer: function() {
      return new  Promise((resolve,reject) =>{
        this.ajax({
          url: this.$options['url']
        }).then(res => {
          resolve(res)
        }).catch(e=>{
          reject(e)
        })
      })
    },
    ajax: function({type = 'GET', url = '', params = {}, async = true}) {
      const request = new XMLHttpRequest();
      return new Promise((resolve, reject) => {
        request.open(type, url, async);
        request.responseType = 'arraybuffer';
        request.onload = () => {

          this.$ctx.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) : reject('decoding error'));
        };
        request.onerror = error => reject(error);
        if (type === 'POST') {
          let formData = new FormData();
          Object.keys(params).forEach(item => {
            formData.set(item, params[item])
          })
          request.send(formData);
        } else {
          request.send();
        }
      });
    },
    _init: function (ctx) {

      this.createAssember(ctx,this.$options.hasOwnProperty('source') ? this.$options.source : null ,()=>{
        this.changeLoop(true)
      });
    },
    createAssember(ctx, sor ,fn) {
      const source = sor ? ctx.createMediaElementSource(sor) : ctx.createBufferSource();
      if (sor) {
        this._beforeCreateAssember(ctx,source, sor)
        fn(this.$assembler)
        this.$ready = true
      } else {
        this.getBuffer().then(res=> {
          this._beforeCreateAssember(ctx,source,res)
          fn(this.$assembler)
          this.$ready = true
        });
      }
    },
    _beforeCreateAssember(ctx,source,sor) {
      const analyser = ctx.createAnalyser();
      const gainNode = ctx.createGain();
      const biquadFilter = ctx.createBiquadFilter();
      const panner = ctx.createPanner();
      source.buffer = sor;
      source.connect(gainNode);
      gainNode.connect(biquadFilter);
      biquadFilter.connect(analyser);
      analyser.connect(panner);
      panner.connect(ctx.destination);
      this.$assembler["gainNode"] = gainNode
      this.$assembler["biquadFilter"] = biquadFilter
      this.$assembler["source"] = source
      this.$assembler["analyser"] = analyser
      this.$assembler["panner"] = panner
    },
    start() {
      if (!this.$status ) {
        if (this.$options.hasOwnProperty('source')) {
          this.$options.source.play();
        }else {
          this.$assembler["source"].start();
        }
        this.$status = true;
      } else {
        this.stop();
      }
    },
    changeLoop(flag) {
      this.$assembler["source"].loop = flag
    },
    stop() {
      if (this.$options.hasOwnProperty('source')) {
        this.$options.source.pause();
      }else {
        this.$assembler["source"].stop();
      }

      this.$status = false;
    }
  }

  const panner = function () {

  }
  panner.prototype = {

  }
  window.YAudio = yAudio;
})
