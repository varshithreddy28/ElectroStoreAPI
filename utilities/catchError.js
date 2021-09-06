// Replaces try catch
module.exports = (fun) => { //means it passes the hole thing which is in bracket to it
    return (req, res, next) => {//again passes the function
        fun(req, res, next).catch(next)//exicutes the funcyion catches any error and then passes to next 
    }
}