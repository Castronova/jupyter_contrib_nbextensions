define([
    'base/js/namespace',
    'jquery',
    'require',
    'base/js/dialog',
    'tree/js/notebooklist',
], function (Jupyter, $, require, dialog, notebooklist)  {

    var load_extension = function() {
        var btn = $(".delete-button");
        btn.unbind();
        btn.on("click", recursiveDelete.bind(this));
    };

    var extension = {
        load_jupyter_extension: load_extension,
        load_ipython_extension: load_extension
    };

function runSerial(paths) {
  var result = Promise.resolve();
  paths.forEach(path => {
    result = result.then(() => Jupyter.notebook_list.contents.delete(path).then(
     function() {
       Jupyter.notebook_list.notebook_deleted(path)
       console.log('deleted: '+path);
     }));
  });
  return result;
}

function deleteDirectory(path, results, level) {

  Jupyter.notebook_list.contents.list_contents(path).then(function(res) {
    var f = results || [path];
    var level = level || 0;
    for (var i =0; i< res.content.length; i++){
      f.push(res.content[i].path);
      if (res.content[i].type == 'directory') {
        level++;
        deleteDirectory(res.content[i].path, f, level);
      }
      if (res.content[i].path === 'notebook') {
          Jupyter.notebook_list.shutdown_notebook(res.content[i].path);
      }
    }
    if(level === 0) {
     console.log(f);
     runSerial(f.reverse());
    }
  });
};

function recursiveDelete (e){

    var message = 'Are you sure you want to permanently delete the files/folders selected?\nThis will include all files and folders within non-empty directories.';

    dialog.modal({
       title : "Delete",
       body : message,
       buttons : {
           Delete : {
               class: "btn-danger",
               click: function() {

                var selected = Jupyter.notebook_list.selected;
                selected.forEach(function(item) {
                    if (item.type == 'directory'){
                    Jupyter.notebook_list.contents.list_contents(item.path).then(function(res) {
                        deleteDirectory(res.path);
                    }).catch(function(e) {
                        alert(e);
                      });
                }
                });
                },
           },
         Cancel : {}
     }
});

};

    return extension;

});

