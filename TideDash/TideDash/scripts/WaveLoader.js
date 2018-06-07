function WaveLoader() {
    this.AddLoader = function (jqObj) {
        var con = $('<div></div>').addClass('loadContainer');
        var loader = $('<div></div>').addClass('loader');
        var top = $('<div></div>').addClass('loading bottom');
        var mid = $('<div></div>').addClass('loading mid');
        var bottom = $('<div></div>').addClass('loading top');
        loader.append(top).append(mid).append(bottom).appendTo(con);
        jqObj.append(con);
    }
    this.ToggleLoader = function (loading) {
        if (loading) {
            $('.loadContainer').css({
                opacity: 0.9,
                'pointer-events':'all'
            });
        }
        else {
            $('.loadContainer').css({
                opacity: 0.0,
                'pointer-events': 'none'
            });
        }
    }
}