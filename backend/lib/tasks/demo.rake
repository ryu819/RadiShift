# frozen_string_literal: true

namespace :demo do
  desc "作成から24時間経過したデモ環境を削除する"
  task cleanup_expired: :environment do
    DemoEnvironment.expired.find_each(&:destroy!)
  end
end
