/* Post Editing */
const countCharactersInTextView = (textView, countView, titleView) => {
  textView.addEventListener('input', () => {
    const text = textView.value;
    const count = text.length;
    countView.innerHTML = count;

    if (count > 280) {
      countView.classList.add('text-danger');
      titleView.classList.remove('u-hidden');
    } else {
      countView.classList.remove('text-danger');
    }
  });
}

const showSelectedImage = (image, imageView) => {
  const files = image.files;
  
  if (files && files.length) {
    imageView.style.display = "block";
    for(let i = 0; i < files.length; i++) {
      let file = files[i];
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.addEventListener("load", function () {
        if(this.result) {     
          imageView.innerHTML = `${imageView.innerHTML}<img src="${this.result}" />`;
        }
      });
    };
  }
}
