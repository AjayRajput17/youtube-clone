
class ApiError extends Error {

    constructor(
        satussCode,
        message = "Something went Wrong",
        errors = [],
        statck = ""
      ){
        super(message);
        this.satussCode = satussCode
        this.data = null
        this.message = message
        this.success = false
        this.error = errors

        if(stack) {
            this.stack = statck
        }else{
            Error.captureStackTrace(this, this.constructor)
        }


      }
}

export {ApiError}