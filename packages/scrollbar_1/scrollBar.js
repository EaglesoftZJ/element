/**
 * Created by EG on 2017/7/10.
 */
import scrollBar from 'perfect-scrollbar';
export default {
  instance: null,
  refArr: {},
  use(refs, instance) {
    this.instance = instance;
    this.refArr[instance._uid] = refs;
    for (let key in refs) {
      if (!/^scroll/.test(key)) {
        continue;
      }
      this.init(refs[key]);
    }
  },
  destroy(instance) {
    delete this.refArr[instance._uid];
  },
  init(ref) {
    scrollBar.initialize(ref);
  },
  scrollTo(ref, scrollTop) {
    ref.scrollTop = scrollTop;
    scrollBar.update(ref);
  },
  update(ref) {
    scrollBar.update(ref);
  }
  // resize() {
  //     let self = this;
  //     $(window).on('resize', function() {
  //         for (let UID in self.refArr) {
  //             for (let key in self.refArr[UID]) {
  //                 if (!/^scroll/.test(key)) {
  //                     continue;
  //                 }
  //                 self.update(self.refArr[UID][key]);
  //             }
  //         }
  //     });
  // }
};
