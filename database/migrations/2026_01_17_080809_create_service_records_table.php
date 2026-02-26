<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_create_service_records_table.php
    public function up()
    {
        Schema::create('service_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('car_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_type_id')->constrained()->onDelete('cascade');
            $table->date('service_date');
            $table->integer('mileage_at_service');
            $table->decimal('cost', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->string('service_provider')->nullable(); // اسم الورشة/المركز
            $table->date('next_due_date')->nullable();
            $table->integer('next_due_mileage')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_records');
    }
};
