
class ApiError extends Error {

    constructor(
        satussCode,
        message = "Something went Wrong",
        error = [],
        stack = ""
      ){
        super(message);
        this.satussCode = satussCode
        this.data = null
        this.message = message
        this.success = false
        this.error = this.error

        if(stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }


      }
}

export {ApiError}