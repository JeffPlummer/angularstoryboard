var ONE_HOUR_IN_MILLIS = 60*60*1000;
var ONE_DAY_IN_MILLIS = 24*60*60*1000; // hours*minutes*seconds*milliseconds

Date.prototype.differenceInYears = function(obj) {
    var diffDays = Math.round(Math.abs((this.getTime() - obj.getTime())/(ONE_DAY_IN_MILLIS)));
    var diffYears = Math.ceil(diffDays/366);
    return diffYears;
};

Date.prototype.differenceInDays = function(obj) {
    var diffDays = Math.round(Math.abs((this.getTime() - obj.getTime())/(ONE_DAY_IN_MILLIS)));
    return diffDays;
};

Date.prototype.differenceInHours = function(obj) {
    var diffHours = Math.round(Math.abs((this.getTime() - obj.getTime())/(ONE_HOUR_IN_MILLIS)));
    return diffHours;
};

Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}