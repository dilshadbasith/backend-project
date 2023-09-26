const ErrorHandler=(err,req,res,next)=>{
    const errStatus=err.statusCode||500;
    const errMsg=err.message||"something went wrong";
    res.status(errStatus).json({
        success:false,
        status:errStatus,
        message:errMsg,
        stack:process.env.NODE_ENV==="development"?err.stack:{},
    })
}
module.exports=ErrorHandler;