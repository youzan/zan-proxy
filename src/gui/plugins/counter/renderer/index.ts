import init from './init';
import EditorField from './components/editor-field';

window.__plugins.counter = {
  init,
  components: {
    EditorField,
  },
};
