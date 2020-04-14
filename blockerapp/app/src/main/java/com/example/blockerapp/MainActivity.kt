package com.example.blockerapp

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.widget.SeekBar
import android.widget.SeekBar.OnSeekBarChangeListener
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.WriterException
import com.journeyapps.barcodescanner.BarcodeEncoder
import kotlinx.android.synthetic.main.activity_main.*
import java.text.SimpleDateFormat
import java.util.*


class MainActivity : AppCompatActivity() {
    private val QR_SIZE: Int = 800;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val self = this

        simpleSeekBar.setOnSeekBarChangeListener(seekBarChangeListener);
        button.setOnClickListener{
            self.makeNewQR()
        }

        this.renderQR()
    }

    private fun getUtcTimestamp(): Int {
        val millis = System.currentTimeMillis()
        val seconds = (millis / 1000).toInt()
        return seconds
    }

    private fun makeNewQR() {
        val formatter = SimpleDateFormat("hh:mm:ss")
        val formatted = formatter.format(Date())
        val seconds = this.getUtcTimestamp()
        val duration = simpleSeekBar.progress
        val string = "${seconds}?A=${duration}"
        qrStatusText.text = "${duration}M-${formatted}"
        this.renderQR(string)
    }

    private fun renderQR(text: String = "test") {
        val multiFormatWriter = MultiFormatWriter();
        try {
            val bitMatrix = multiFormatWriter.encode(
                text, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE
            );
            val barcodeEncoder = BarcodeEncoder();
            val bitmap = barcodeEncoder.createBitmap(bitMatrix);
            imageView.setImageBitmap(bitmap);
        } catch (e: WriterException) {
            e.printStackTrace();
        }
    }

    var seekBarChangeListener: OnSeekBarChangeListener = object : OnSeekBarChangeListener {
        override fun onProgressChanged(
            seekBar: SeekBar,
            progress: Int,
            fromUser: Boolean
        ) { // updated continuously as the user slides the thumb
            durationText.text = "Duration: $progress minutes";
        }

        override fun onStartTrackingTouch(seekBar: SeekBar) { // called when the user first touches the SeekBar
        }

        override fun onStopTrackingTouch(seekBar: SeekBar) { // called after the user finishes moving the SeekBar
        }
    }
}
