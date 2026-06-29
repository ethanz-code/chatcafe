import axios from '@/utils/axios'

export class PaymentStatusPoller {
  constructor({ orderNo, interval = 3000, maxAttempts = 60, onSuccess, onFailed, onTimeout }) {
    this.orderNo = orderNo
    this.interval = interval
    this.maxAttempts = maxAttempts
    this.onSuccess = onSuccess
    this.onFailed = onFailed
    this.onTimeout = onTimeout
    this.attempts = 0
    this.stopped = false
    this.timer = null
  }

  async start() {
    const poll = async () => {
      if (this.stopped || this.attempts >= this.maxAttempts) {
        if (this.attempts >= this.maxAttempts && this.onTimeout) this.onTimeout()
        return
      }
      this.attempts++
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/user/service/pay/status/${this.orderNo}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.status === 200) {
          const parsed = response.data
          if (parsed.status === 0 && parsed.data?.paymentStatus === 'paid') {
            if (this.onSuccess) this.onSuccess()
            return
          }
        }
      } catch {}
      if (!this.stopped) this.timer = setTimeout(poll, this.interval)
    }
    poll()
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
  }
}
