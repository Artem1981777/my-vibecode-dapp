// contract/index.ts
// Daily BTC Tip Jar — OPNet L1 Contract
// AssemblyScript → WASM
// Vibecode Bible style: deterministic, bounded storage, explicit checks

// NOTE:
// The imports below represent typical OPNet runtime primitives.
// Actual paths may vary depending on the OPNet SDK.

import {
  Address,
  Map,
  Vector,
  Context,
  Blockchain,
  transfer,
  revert
} from "opnet";

// --------------------------------------------------
// Constants
// --------------------------------------------------

const DAY: u64 = 86400;        // 24 hours
const WEEK: u64 = 604800;      // 7 days
const MAX_TIPS: i32 = 10;

// --------------------------------------------------
// Tip Struct
// --------------------------------------------------

@unmanaged
class Tip {
  sender: Address;
  amount: u64;
  timestamp: u64;

  constructor(sender: Address, amount: u64, timestamp: u64) {
    this.sender = sender;
    this.amount = amount;
    this.timestamp = timestamp;
  }
}

// --------------------------------------------------
// Contract Storage
// --------------------------------------------------

let last_tip_time = new Map<Address, u64>();
let recent_tips = new Vector<Tip>();

let jar_balance: u64 = 0;

let owner: Address;
let last_withdraw_time: u64 = 0;

// --------------------------------------------------
// Constructor / Init
// --------------------------------------------------

export function init(initialOwner: Address): void {
  if (owner != Address.empty()) {
    revert("Already initialized");
  }

  owner = initialOwner;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function now(): u64 {
  return Blockchain.timestamp();
}

function sender(): Address {
  return Context.sender();
}

function value(): u64 {
  return Context.value();
}

// --------------------------------------------------
// Tip Function
// --------------------------------------------------

export function tip(): void {
  const from = sender();
  const amount = value();

  if (amount <= 0) {
    revert("Tip amount must be greater than zero");
  }

  const currentTime = now();

  // Read last tip timestamp
  let lastTime: u64 = 0;

  if (last_tip_time.has(from)) {
    lastTime = last_tip_time.get(from);
  }

  // Cooldown check
  if (currentTime - lastTime < DAY) {
    revert("Tip cooldown active");
  }

  // Update cooldown
  last_tip_time.set(from, currentTime);

  // Increase jar balance
  jar_balance += amount;

  // Record tip
  const newTip = new Tip(from, amount, currentTime);
  recent_tips.push(newTip);

  // Trim to max 10 entries
  if (recent_tips.length > MAX_TIPS) {
    recent_tips.shift();
  }
}

// --------------------------------------------------
// Withdraw Function
// --------------------------------------------------

export function withdraw(): void {
  const from = sender();

  if (from != owner) {
    revert("Only owner can withdraw");
  }

  const currentTime = now();

  if (currentTime - last_withdraw_time < WEEK) {
    revert("Withdraw cooldown active");
  }

  if (jar_balance == 0) {
    revert("Jar is empty");
  }

  const amount = jar_balance;

  // Effects before interaction (reentrancy-safe)
  jar_balance = 0;
  last_withdraw_time = currentTime;

  // Transfer BTC to owner
  transfer(owner, amount);
}

// --------------------------------------------------
// View Functions
// --------------------------------------------------

export function getJarBalance(): u64 {
  return jar_balance;
}

export function getRecentTips(): Vector<Tip> {
  return recent_tips;
}

export function getLastTipTime(addr: Address): u64 {
  if (last_tip_time.has(addr)) {
    return last_tip_time.get(addr);
  }
  return 0;
}

export function getOwner(): Address {
  return owner;
}

export function getLastWithdrawTime(): u64 {
  return last_withdraw_time;
}
