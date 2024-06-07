
// The DOM element you wish to replace with Tagify
var tags_input = document.querySelector('input[name=tags]');


// initialize Tagify on the above input node reference
new Tagify(tags_input, {
    maxTags: 5,
    duplicates: false,
    delimiters: "`",
    classname: "form-control"
});