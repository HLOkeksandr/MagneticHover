import Validator from "./validator";
/**
 * @class
 */
export default class MagneticHover {
  /**
   * @param {Object} options of arguments
   * @param  {HTMLElement} options.element
   * @param  {number} options.radius radius around the element on which it is triggered callback
   * @callback options.callback The callback that handles the response.
   */

  /**
   * @function callback of MagneticHover
   * @param  {number} distance
   */
  constructor(options) {
    this._checkArguments(options);
    const callback = options.callback || ((distance) => console.log(distance));
    this.element = options.element;
    this.radius = options.radius;
    this.cb = callback;
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._init();
  }

  distance = 0;
  POSITION_VARIANTS = {
    TOP_LEFT: "TOP_LEFT",
    TOP: "TOP",
    TOP_RIGHT: "TOP_RIGHT",
    RIGHT: "RIGHT",
    BOTTOM_RIGHT: "BOTTOM_RIGHT",
    BOTTOM: "BOTTOM",
    BOTTOM_LEFT: "BOTTOM_LEFT",
    LEFT: "LEFT",
    MIDDLE: "MIDDLE",
  };

  /**
   * @return {Object} elementPosition - element coordinates
   * @return {number} elementPosition.top
   * @return {number} elementPosition.left
   * @return {number} elementPosition.right
   * @return {number} elementPosition.bottom
   */
  get _elementPosition() {
    return {
      top: this.element.offsetTop,
      left: this.element.offsetLeft,
      right: this.element.offsetWidth + this.element.offsetLeft,
      bottom: this.element.offsetHeight + this.element.offsetTop,
    };
  }

  /**
   * @method _mouseMoveRange this getter return object with mouse move range coordinates
   * @return {Object} rangePosition
   * @return {number} rangePosition.top
   * @return {number} rangePosition.left
   * @return {number} rangePosition.right
   * @return {number} rangePosition.bottom
   */
  get _mouseMoveRange() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const topMouseRangePosition = this.element.offsetTop - this.radius;

    const leftMouseRangePosition = this.element.offsetLeft - this.radius;

    const rightMouseRangePosition =
      this.element.offsetWidth + this.element.offsetLeft + this.radius;

    const bottomMouseRangePosition =
      this.element.offsetHeight + this.element.offsetTop + this.radius;

    const top = topMouseRangePosition < 0 ? 0 : topMouseRangePosition;
    const left = leftMouseRangePosition < 0 ? 0 : leftMouseRangePosition;
    const right =
      rightMouseRangePosition > screenWidth
        ? screenWidth
        : rightMouseRangePosition;
    const bottom =
      bottomMouseRangePosition > screenHeight
        ? screenHeight
        : bottomMouseRangePosition;
    return {
      top,
      left,
      right,
      bottom,
    };
  }
  /**@method _maxHypotenuse this getter return max length from uttermost point of element to uttermost point mouse move range
   * @return {number}
   */
  get _maxHypotenuse() {
    return this._getHypotenuse(this.radius, this.radius);
  }

  /**
   * @method _isWithinRange This function check cursor position in element radius range
   * @param  {number} x cursor position on x axis
   * @param  {number} y cursor position on x axis
   * @return {boolean}
   */
  _isWithinRange(x, y) {
    return (
      x > this._mouseMoveRange.left &&
      x < this._mouseMoveRange.right &&
      y < this._mouseMoveRange.bottom &&
      y > this._mouseMoveRange.top
    );
  }

  /**
   * @method _getHypotenuse this function find hypotenuse of equilateral triangle
   * @param  {number} sideX length of the side
   * @param  {number} sideY length of the side
   * @return {number}
   */
  _getHypotenuse(sideX, sideY) {
    return Math.sqrt(Math.pow(sideX, 2) + Math.pow(sideY, 2));
  }
  /**
   * @method  _getPercent this function return currentValue value in persent
   * @param  {} maxValue
   * @param  {} currentValue
   * @return {number}
   */
  _getPercent(maxValue, currentValue) {
    return Math.floor((Math.abs(currentValue) / maxValue) * 100);
  }

  /**
   * @method _getCursorPosition
   * @param  {number} x cursor position on x axis
   * @param  {number} y cursor position on x axis
   * @return {string}
   */
  _getCursorPosition(x, y) {
    if (x < this._elementPosition.left && y < this._elementPosition.top) {
      return this.POSITION_VARIANTS.TOP_LEFT;
    }
    if (
      x > this._elementPosition.left &&
      x < this._elementPosition.right &&
      y < this._elementPosition.top
    ) {
      return this.POSITION_VARIANTS.TOP;
    }
    if (x > this._elementPosition.right && y < this._elementPosition.top) {
      return this.POSITION_VARIANTS.TOP_RIGHT;
    }
    if (
      x > this._elementPosition.right &&
      y > this._elementPosition.top &&
      y < this._elementPosition.bottom
    ) {
      return this.POSITION_VARIANTS.RIGHT;
    }
    if (x > this._elementPosition.right && y > this._elementPosition.bottom) {
      return this.POSITION_VARIANTS.BOTTOM_RIGHT;
    }
    if (
      x > this._elementPosition.left &&
      x < this._elementPosition.right &&
      y > this._elementPosition.bottom
    ) {
      return this.POSITION_VARIANTS.BOTTOM;
    }
    if (x < this._elementPosition.left && y > this._elementPosition.bottom) {
      return this.POSITION_VARIANTS.BOTTOM_LEFT;
    }
    if (
      x < this._elementPosition.left &&
      y > this._elementPosition.top &&
      y < this._elementPosition.bottom
    ) {
      return this.POSITION_VARIANTS.LEFT;
    }
    if (
      x > this._elementPosition.left &&
      x < this._elementPosition.right &&
      y > this._elementPosition.top &&
      y < this._elementPosition.bottom
    ) {
      return this.POSITION_VARIANTS.MIDDLE;
    }
  }

  /**
   * @method _getDiagonalDistance this function find length from element to cursor and return value in persent
   * @param  {number} sideX length of the side
   * @param  {number} sideY length of the side
   * @return {nubmer}
   */
  _getDiagonalDistance(sideX, sideY) {
    const hypotenuse = this._getHypotenuse(sideX, sideY);
    return this._getPercent(this._maxHypotenuse, hypotenuse);
  }
  /**
   * @method _getResultingDistance this function return distance to element in the ratio from 1 to 100
   * @param  {number} x cursor position on x axis
   * @param  {number} y cursor position on x axis
   * @return {number} distance
   */
  _getResultingDistance(x, y) {
    let resultingDistance = this.distance;
    switch (this._getCursorPosition(x, y)) {
      case this.POSITION_VARIANTS.MIDDLE: {
        resultingDistance = 0;
        break;
      }
      case this.POSITION_VARIANTS.TOP_LEFT: {
        resultingDistance = this._getDiagonalDistance(
          this._elementPosition.left - x,
          this._elementPosition.top - y
        );
        break;
      }
      case this.POSITION_VARIANTS.TOP: {
        resultingDistance = this._getPercent(
          this.radius,
          this._elementPosition.top - y
        );
        break;
      }
      case this.POSITION_VARIANTS.TOP_RIGHT: {
        resultingDistance = this._getDiagonalDistance(
          this._elementPosition.right - x,
          this._elementPosition.top - y
        );

        break;
      }
      case this.POSITION_VARIANTS.RIGHT: {
        resultingDistance = this._getPercent(
          this.radius,
          this._elementPosition.right - x
        );
        break;
      }
      case this.POSITION_VARIANTS.BOTTOM_RIGHT: {
        resultingDistance = this._getDiagonalDistance(
          this._elementPosition.right - x,
          this._elementPosition.bottom - y
        );

        break;
      }
      case this.POSITION_VARIANTS.BOTTOM: {
        resultingDistance = this._getPercent(
          this.radius,
          this._elementPosition.bottom - y
        );

        break;
      }
      case this.POSITION_VARIANTS.BOTTOM_LEFT: {
        resultingDistance = this._getDiagonalDistance(
          this._elementPosition.left - x,
          this._elementPosition.bottom - y
        );

        break;
      }
      case this.POSITION_VARIANTS.LEFT: {
        resultingDistance = this._getPercent(
          this.radius,
          this._elementPosition.left - x
        );

        break;
      }
      default:
        break;
    }
    return resultingDistance;
  }
  /**
   * @method _handleMouseMove event listener
   * @param  {number} x cursor position on x axis
   * @param  {number} y cursor position on x axis
   * @return {null}
   */
  _handleMouseMove({ clientX: x, clientY: y }) {
    if (!this._isWithinRange(x, y)) return;
    this.distance = this._getResultingDistance(x, y);
    this.cb(this.distance);
  }

  /**
   * @method _checkArgument check class arguments
   * @param  {object} args
   * @param  {boolean} args.check some expression, which return boolean
   * @param  {string} eargs.rrorMessage error message
   * @return {null}
   */
  _checkArguments(args) {
    if (!Validator.checkOnElement(args.element)) {
      Validator.showError("element is not HTMLElement");
    }
    if (!Validator.checkOnType(args.radius, "number")) {
      Validator.showError("radius must be a number");
    }
    if (!Validator.checkOnType(args.callback, "function")) {
      Validator.showError("callback must be a function");
    }
  }

  _init() {
    window.addEventListener("mousemove", this._handleMouseMove);
  }
  /**
   * @method disable remove event listener from window
   */
  destroy() {
    window.removeEventListener("mousemove", this._handleMouseMove);
  }
}
