Vue.component('modal', {
  template: '#modal-template',
  props: {
    onSubmit: Function,
    showCondition: Boolean
  },
  
  data: function() {
    return {
      input: "",
      show: true
    }
  },

  methods: {
    buttonClicked: function() {
      this.onSubmit(this.input);
      this.input = "";
    }
  }
})