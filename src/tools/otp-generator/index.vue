<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { decodeBase32, generateSecret, OTP_ALGOS, otpauthUri, secondsRemaining, totp, hotp, verifyOtp, type OtpAlgo, type OtpKind } from './logic'

const kind = ref<OtpKind>('totp')
const secret = ref(generateSecret())
const account = ref('ada@example.com')
const issuer = ref('SimpleTools')
const digits = ref<6 | 8>(6)
const period = ref(30)
const counter = ref(0)
const algo = ref<OtpAlgo>('SHA-1')
const windowSize = ref(1)
const code = ref('')
const check = ref('')
const verdict = ref('')
const now = ref(Date.now())
const qr = ref('')
let timer = 0

const decoded = computed(() => decodeBase32(secret.value))
const uri = computed(() =>
  decoded.value
    ? otpauthUri({ kind: kind.value, secret: secret.value, account: account.value, issuer: issuer.value, digits: digits.value, period: period.value, counter: counter.value, algo: algo.value })
    : '',
)
const remaining = computed(() => (kind.value === 'totp' ? secondsRemaining(now.value, period.value) : 0))

async function refresh() {
  now.value = Date.now()
  if (!decoded.value) {
    code.value = ''
    return
  }
  code.value = kind.value === 'totp'
    ? await totp(decoded.value, now.value, period.value, digits.value, algo.value)
    : await hotp(decoded.value, BigInt(Math.max(0, Math.floor(counter.value) || 0)), digits.value, algo.value)
}

async function renderQr() {
  if (!uri.value) {
    qr.value = ''
    return
  }
  const QR = await import('qrcode')
  qr.value = await QR.toDataURL(uri.value, { margin: 1, width: 220 })
}

async function verify() {
  if (!decoded.value) {
    verdict.value = 'bad-secret'
    return
  }
  const result = await verifyOtp(decoded.value, check.value, {
    kind: kind.value,
    digits: digits.value,
    period: period.value,
    counter: counter.value,
    algo: algo.value,
    window: windowSize.value,
  }, Date.now())
  verdict.value = result.ok ? 'match' : 'mismatch'
}

watch([kind, secret, digits, period, counter, algo], () => { void refresh(); void renderQr() }, { immediate: true })
onMounted(() => { timer = window.setInterval(() => void refresh(), 1000) })
onUnmounted(() => window.clearInterval(timer))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" :variant="kind === 'totp' ? 'default' : 'outline'" @click="kind = 'totp'">TOTP</Button>
      <Button size="sm" :variant="kind === 'hotp' ? 'default' : 'outline'" @click="kind = 'hotp'">HOTP</Button>
      <Button size="sm" variant="outline" @click="secret = generateSecret()">{{ $t('tools.otp-generator.newSecret') }}</Button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2 sm:col-span-2">
        {{ $t('tools.otp-generator.secret') }}
        <Input v-model="secret" class="font-mono" data-testid="otp-secret" />
      </Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.otp-generator.issuer') }}<Input v-model="issuer" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.otp-generator.account') }}<Input v-model="account" /></Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.otp-generator.digits') }}
        <select v-model.number="digits" class="border-input bg-background h-10 w-full rounded-md border px-3"><option :value="6">6</option><option :value="8">8</option></select>
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.otp-generator.algo') }}
        <select v-model="algo" class="border-input bg-background h-10 w-full rounded-md border px-3"><option v-for="item in OTP_ALGOS" :key="item" :value="item">{{ item }}</option></select>
      </Label>
      <Label v-if="kind === 'totp'" class="flex flex-col items-start gap-2">{{ $t('tools.otp-generator.period') }}<Input v-model.number="period" type="number" min="15" max="120" /></Label>
      <Label v-else class="flex flex-col items-start gap-2">{{ $t('tools.otp-generator.counter') }}<Input v-model.number="counter" type="number" min="0" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.otp-generator.window') }}<Input v-model.number="windowSize" type="number" min="0" max="5" /></Label>
    </div>
    <ErrorAlert v-if="!decoded" :message="$t('tools.otp-generator.badSecret')" />
    <section class="flex flex-col gap-3 rounded-lg border p-3">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="code" />
      </div>
      <p class="font-mono text-4xl tracking-[0.3em]" data-testid="tool-output">{{ code || '—' }}</p>
      <p v-if="kind === 'totp'" class="text-muted-foreground text-sm">{{ $t('tools.otp-generator.remaining', { n: remaining }) }}</p>
      <div v-if="qr" class="flex flex-col items-start gap-2">
        <img :src="qr" width="220" height="220" alt="" class="rounded-md border bg-white p-2" />
        <div class="flex w-full items-start gap-2">
          <code class="min-w-0 flex-1 font-mono text-xs break-all">{{ uri }}</code>
          <CopyButton :text="uri" :label="false" />
        </div>
      </div>
    </section>
    <section class="flex flex-col gap-2">
      <Label>{{ $t('tools.otp-generator.check') }}</Label>
      <div class="flex flex-wrap gap-2">
        <Input v-model="check" class="max-w-xs font-mono" />
        <Button variant="outline" @click="verify">{{ $t('tools.otp-generator.verify') }}</Button>
      </div>
      <p v-if="verdict === 'match'" class="text-sm text-emerald-600">{{ $t('tools.otp-generator.match') }}</p>
      <p v-else-if="verdict" class="text-destructive text-sm">{{ $t('tools.otp-generator.mismatch') }}</p>
    </section>
  </div>
</template>
