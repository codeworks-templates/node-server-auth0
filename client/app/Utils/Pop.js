export class Pop {

  /**
   * @typedef {{message: string, response:{ data: any}}} AxiosError
   */

  /**
    * @param {string} title The title text.
    * @param {string} text The body text.
    * @param {string} icon 'success', 'error', 'info', 'warning', or 'question'.
    * @param {string} confirmButtonText The text of your confirm button.
    * -----------------------------------
    * {@link https://sweetalert2.github.io/#configuration|Check out Sweet Alerts}
  */
  static async confirm(title = 'Are you sure?', text = "You won't be able to revert this!", icon = 'warning', confirmButtonText = 'Yes, delete it!') {
    try {
      // @ts-ignore
      const res = await Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: confirmButtonText
      })
      if (res.isConfirmed) {
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  /**
   * @param {string} title The title text
   * @param {string} display 'success', 'error', 'info', 'warning', or 'question'.
   * @param {string} position 'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end', 'bottom', 'bottom-start', or 'bottom-end'.
   * @param {number} timer Time in milliseconds.
   * @param {boolean} progressBar Show progress bar or not respectively.
   * -----------------------------------
   * {@link https://sweetalert2.github.io/#configuration|Check out Sweet Alerts}
   */
  static toast(title = 'Warning!', display = 'warning', position = 'top-end', timer = 3000, progressBar = true) {
    // @ts-ignore
    Swal.fire({
      title: title,
      icon: display,
      position: position,
      timer: timer,
      timerProgressBar: progressBar,
      toast: true,
      showConfirmButton: false
    })
  }

  /**
   * @param {import('axios').AxiosError | Error | String } Error An Error Object.
   */
  static error(error) {
    if (error.isAxiosError) {
      const { response } = error
      this.toast(response.data.error?.message || response.data.message, 'error')
    } else {
      this.toast(error.message || error, 'error')
    }
  }

  /**
   * @param { String } message The message to display. If not provided, will display a generic message.
   */
  static success(message = 'Success!') {
    this.toast(message, 'success')
  }
}
