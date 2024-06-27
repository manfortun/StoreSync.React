const LoadingScreen = ({message}) => {
    return (
        <div className="container-fluid d-flex flex-row justify-content-center m-auto">
            <div className="m-auto">
                {message }
            </div>
        </div>
    )
}

export default LoadingScreen;