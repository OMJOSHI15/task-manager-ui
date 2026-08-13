function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <p className="error-box__text">⚠ {message || 'Something went wrong.'}</p>
      {onRetry && (
        <button type="button" className="error-box__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
